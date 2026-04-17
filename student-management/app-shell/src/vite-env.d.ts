/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAFKA_GATEWAY_URL: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV: "local" | "staging" | "production";
  readonly VITE_TENANT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
