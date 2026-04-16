// AI-GENERATED
// Route guard — đọc security config từ app-contract.json
import contract from "../../../app-contract.json";

export function isPublicRoute(pathname: string): boolean {
  return contract.security.publicRoutes.includes(pathname);
}

export function requiresAuth(pathname: string): boolean {
  if (contract.security.defaultPolicy === "public") return false;
  return !isPublicRoute(pathname);
}

export function guardRoute(
  pathname: string,
  isAuthenticated: boolean,
  onDeny: () => void
): void {
  if (requiresAuth(pathname) && !isAuthenticated) {
    onDeny();
  }
}
