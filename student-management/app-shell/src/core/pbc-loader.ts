// AI-GENERATED
// Vite Module Federation — static remotes, dynamic mount
import registry from "../../pbc-registry.json";

export interface PBCEntry {
  pbcId: string;
  version: string;
  remoteUrl: string;
  scope: string;
  module: string;
  routePrefix: string;
  label?: string;
  enabled: boolean;
}

export function getEnabledPBCs(): PBCEntry[] {
  return registry.pbcList.filter((pbc) => pbc.enabled) as PBCEntry[];
}

// Map scope → dynamic import factory
// Vite MF yêu cầu import path phải là string literal tại build time
const remoteImporters: Record<string, () => Promise<any>> = {
  pbc_auth:               () => import("pbc_auth/bootstrap"),
  pbc_student_management: () => import("pbc_student_management/bootstrap"),
  pbc_class_management:   () => import("pbc_class_management/bootstrap"),
  pbc_course_management:  () => import("pbc_course_management/bootstrap"),
  pbc_subject_management: () => import("pbc_subject_management/bootstrap"),
  pbc_notification:       () => import("pbc_notification/bootstrap"),
};

export async function mountPBC(entry: PBCEntry, container: HTMLElement): Promise<void> {
  const importer = remoteImporters[entry.scope];
  if (!importer) {
    container.innerHTML = `<div style="padding:16px;color:#cf1322">Unknown PBC scope: ${entry.scope}</div>`;
    return;
  }

  try {
    const mod = await importer();
    const Component = mod?.default;

    if (!Component) {
      throw new Error(`"${entry.pbcId}" không có default export`);
    }

    const React = (await import("react")).default;
    const { createRoot } = await import("react-dom/client");
    createRoot(container).render(React.createElement(Component));
  } catch (err) {
    console.error(`[pbc-loader] Error mounting ${entry.pbcId}:`, err);
    container.innerHTML = `
      <div style="padding:16px;color:#cf1322;background:#fff2f0;border:1px solid #ffccc7;border-radius:4px;margin:16px">
        <strong>Không thể tải module: ${entry.pbcId}</strong><br/>
        <small>${(err as Error).message}</small>
      </div>`;
  }
}
