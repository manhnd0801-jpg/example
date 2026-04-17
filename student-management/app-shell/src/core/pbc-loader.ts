// app-shell/src/core/pbc-loader.ts
// R-06: App Shell hỗ trợ dynamic loading PBC (Module Federation)
// R-09: Version PBC phải khai báo semver range trong pbc-registry.json
import registry from "../../../pbc-registry.json";
import { isFeatureEnabled } from "../config/feature-flags";
import { REMOTE_IMPORT_MAP } from "./remote-imports";

export type PBCConfig = (typeof registry.pbcs)[number];

export interface PBCEntry {
  pbcId: string;
  version: string;
  remoteUrl: string;
  scope: string;
  module: string;
  routePrefix: string;
  label?: string;
  icon?: string;
  enabled: boolean;
}

const APP_ENV =
  (import.meta.env.VITE_ENV as "local" | "staging" | "production") ?? "local";

export function getRemoteEntry(pbc: PBCConfig): string {
  return pbc.environments[APP_ENV]?.remoteEntry ?? pbc.remoteEntry;
}

// ── New API (blueprint v3.0) ──────────────────────────────────────────────────

export function getPBCs(): PBCConfig[] {
  return registry.pbcs;
}

export function getPBCById(id: string): PBCConfig | undefined {
  return registry.pbcs.find((p) => p.id === id);
}

// ── Legacy API (backward compat với Shell.tsx / main.tsx) ────────────────────

export function getEnabledPBCs(): PBCEntry[] {
  return registry.pbcs.map((pbc) => ({
    pbcId:      pbc.id,
    version:    pbc.version,
    remoteUrl:  getRemoteEntry(pbc),
    scope:      pbc.scope,
    module:     pbc.exposedModule,
    routePrefix: pbc.mountPath,
    label:      (pbc as { label?: string }).label,
    icon:       (pbc as { icon?: string }).icon,
    enabled:    true,
  }));
}

export function getPBCByRoute(pathname: string): PBCEntry | undefined {
  return getEnabledPBCs().find(
    (pbc) =>
      pbc.pbcId !== "pbc-auth" &&
      (pathname === pbc.routePrefix || pathname.startsWith(pbc.routePrefix + "/")),
  );
}

// ── Module cache ──────────────────────────────────────────────────────────────
const moduleCache = new Map<string, unknown>();

/**
 * Import exposed module từ PBC remote.
 * Dùng REMOTE_IMPORT_MAP với literal import strings để Vite transform đúng lúc build.
 * R-18: remote-imports.ts phải có literal import cho mọi slot trong enabledSlots
 */
export async function importFromRemote<T = unknown>(
  entry: PBCEntry,
  modulePath: string,
): Promise<T> {
  const normalizedModule = modulePath.replace(/^\.\//, "");
  const key = `${entry.scope}/${normalizedModule}`;

  if (moduleCache.has(key)) {
    return moduleCache.get(key) as T;
  }

  const importFn = REMOTE_IMPORT_MAP[key];
  if (!importFn) {
    throw new Error(
      `[pbc-loader] No import registered for '${key}'. ` +
        `Add it to src/core/remote-imports.ts as a literal import string.`,
    );
  }

  const result = (await importFn()) as T;
  moduleCache.set(key, result);
  return result;
}

/**
 * Load PBC theo blueprint v3.0 API
 */
export async function loadPBC(pbcId: string): Promise<unknown> {
  if (!isFeatureEnabled(pbcId)) {
    throw new Error(`[PBCLoader] PBC "${pbcId}" bị tắt bởi feature flag`);
  }

  const pbc = registry.pbcs.find((p) => p.id === pbcId);
  if (!pbc) throw new Error(`[PBCLoader] Không tìm thấy PBC: ${pbcId}`);

  const entry: PBCEntry = {
    pbcId:      pbc.id,
    version:    pbc.version,
    remoteUrl:  getRemoteEntry(pbc),
    scope:      pbc.scope,
    module:     pbc.exposedModule,
    routePrefix: pbc.mountPath,
    enabled:    true,
  };

  return importFromRemote(entry, pbc.exposedModule);
}
