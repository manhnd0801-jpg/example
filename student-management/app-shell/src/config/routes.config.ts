// app-shell/src/config/routes.config.ts
// Tự động sinh từ pbc-registry.json — không khai báo thủ công
import registry from "../../../pbc-registry.json";

export interface RouteConfig {
  path: string;
  pbcId: string;
  permissions: string[];
  lazy: boolean;
}

export const ROUTES: RouteConfig[] = registry.pbcs.map((pbc) => ({
  path: pbc.mountPath,
  pbcId: pbc.id,
  permissions: pbc.permissions,
  lazy: pbc.lazy,
}));
