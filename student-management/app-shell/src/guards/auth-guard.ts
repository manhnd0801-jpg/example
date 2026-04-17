// app-shell/src/guards/auth-guard.ts
// Re-export từ core/auth-guard.ts để backward compat với các import cũ
export * from "../core/auth-guard";

// Legacy API — giữ để không break main.tsx hiện tại
import contract from "../../../app-contract.json";

export function requiresAuth(pathname: string): boolean {
  if (contract.security.defaultPolicy === "public") return false;
  const publicRoutes = contract.security.publicRoutes as string[];
  return !publicRoutes.includes(pathname);
}
