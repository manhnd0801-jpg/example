// app-shell/src/config/env.ts
// Wrapper an toàn cho biến môi trường — không import.meta.env trực tiếp ở nhiều chỗ

export const ENV = {
  // Kafka Gateway WebSocket URL (browser kết nối vào đây, không phải broker trực tiếp — R-03a)
  KAFKA_GATEWAY_URL: import.meta.env.VITE_KAFKA_GATEWAY_URL as string,
  CDN_BASE_URL:      import.meta.env.VITE_CDN_BASE_URL as string,
  API_BASE_URL:      import.meta.env.VITE_API_BASE_URL as string,
  APP_ENV:           (import.meta.env.VITE_ENV ?? "local") as "local" | "staging" | "production",
  TENANT_ID:         (import.meta.env.VITE_TENANT_ID ?? "dev-tenant") as string,
  IS_PRODUCTION:     import.meta.env.PROD === true,
} as const;

// Kiểm tra bắt buộc khi khởi động
export function validateEnv(): void {
  const required: (keyof typeof ENV)[] = ["KAFKA_GATEWAY_URL", "CDN_BASE_URL", "API_BASE_URL"];
  const missing = required.filter((k) => !ENV[k]);
  if (missing.length > 0) {
    throw new Error(`[Env] Thiếu biến môi trường: ${missing.join(", ")}`);
  }
}
