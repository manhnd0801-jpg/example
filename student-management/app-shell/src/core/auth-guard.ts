// app-shell/src/core/auth-guard.ts
// R-08: App Shell phải có Auth Guard bảo vệ route trước khi load PBC
import { getSession, getAccessToken } from "./token-manager";
import manifest from "../../../app-manifest.json";

export function isPublicRoute(path: string): boolean {
  return (manifest.security.publicRoutes as string[]).includes(path);
}

export function hasPermission(requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true;
  const session = getSession();
  if (!session) return false;
  return requiredRoles.some((role) => session.roles.includes(role));
}

export function isAuthenticated(): boolean {
  // Kiểm tra in-memory session trước, fallback sang localStorage (backward compat)
  return !!getSession() || !!getAccessToken();
}

export function guardRoute(
  path: string,
  requiredRoles: string[] = [],
): boolean {
  if (isPublicRoute(path)) return true;
  if (!isAuthenticated()) {
    sessionStorage.setItem("returnTo", path);
    window.location.href = "/login";
    return false;
  }
  if (!hasPermission(requiredRoles)) {
    window.location.href = "/403";
    return false;
  }
  return true;
}
