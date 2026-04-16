// AI-GENERATED
import registry from "../../../pbc-registry.json";
import { REMOTE_IMPORT_MAP } from "./remote-imports";

export interface PBCEntry {
  pbcId: string;
  version: string;
  remoteUrl: string;
  scope: string;
  module: string;
  routePrefix: string;
  enabled: boolean;
}

export function getEnabledPBCs(): PBCEntry[] {
  return registry.pbcList.filter((pbc) => pbc.enabled) as PBCEntry[];
}

export function getPBCByRoute(pathname: string): PBCEntry | undefined {
  return getEnabledPBCs().find(
    (pbc) =>
      pbc.pbcId !== "auth" &&
      (pathname === pbc.routePrefix || pathname.startsWith(pbc.routePrefix + "/"))
  );
}

const moduleCache = new Map<string, unknown>();

/**
 * Import exposed module từ PBC remote.
 * Dùng REMOTE_IMPORT_MAP với literal import strings để Vite transform đúng lúc build.
 */
export async function importFromRemote<T = unknown>(
  entry: PBCEntry,
  modulePath: string
): Promise<T> {
  // Normalize module path: './LoginSlot' → 'LoginSlot'
  const normalizedModule = modulePath.replace(/^\.\//, "");
  const key = `${entry.scope}/${normalizedModule}`;
  const cacheKey = key;

  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey) as T;
  }

  const importFn = REMOTE_IMPORT_MAP[key];
  if (!importFn) {
    throw new Error(
      `[pbc-loader] No import registered for '${key}'. ` +
      `Add it to src/core/remote-imports.ts as a literal import string.`
    );
  }

  const result = await importFn() as T;
  moduleCache.set(cacheKey, result);
  return result;
}
