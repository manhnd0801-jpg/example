// AI-GENERATED
// Dynamic load PBC từ pbc-registry.json — lazy load theo route
import registry from "../../pbc-registry.json";

export interface PBCEntry {
  pbcId: string;
  version: string;
  remoteUrl: string;
  scope: string;
  module: string;
  customElementTag: string;
  routePrefix: string;
  enabled: boolean;
}

export function getEnabledPBCs(): PBCEntry[] {
  return registry.pbcList.filter((pbc) => pbc.enabled) as PBCEntry[];
}

export async function loadPBC(entry: PBCEntry): Promise<void> {
  const existingScript = document.querySelector(
    `script[data-pbc="${entry.pbcId}"]`
  );
  if (existingScript) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = entry.remoteUrl;
    script.dataset.pbc = entry.pbcId;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`[pbc-loader] Failed to load ${entry.pbcId} from ${entry.remoteUrl}`));
    document.head.appendChild(script);
  });
}

export async function mountPBC(entry: PBCEntry, container: HTMLElement): Promise<void> {
  await loadPBC(entry);
  const el = document.createElement(entry.customElementTag);
  container.appendChild(el);
}
