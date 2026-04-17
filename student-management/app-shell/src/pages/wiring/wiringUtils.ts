// Wiring canvas — utilities
// Convert app-wiring.json → React Flow nodes/edges
// version trong node được đọc từ app-wiring.json và cross-check với pbc-registry.json
import type { Node, Edge } from "@xyflow/react";
import wiringData from "../../../../app-wiring.json";
import registry from "../../../../pbc-registry.json";
import type { WiringNodeData, WiringEdgeMeta } from "./types";

// Màu cho từng PBC
const PBC_COLORS: Record<string, string> = {
  "pbc-auth":               "#722ed1",
  "pbc-student-management": "#1677ff",
  "pbc-class-management":   "#13c2c2",
  "pbc-course-management":  "#fa8c16",
  "pbc-subject-management": "#eb2f96",
  "pbc-notification":       "#52c41a",
};

const DEFAULT_COLOR = "#8c8c8c";

// Lấy version từ pbc-registry để cross-check
function getRegistryVersion(pbcId: string): string | undefined {
  return registry.pbcs.find((p) => p.id === pbcId)?.version;
}

// So sánh version trong wiring vs registry — cảnh báo nếu lệch
export function checkVersionMismatch(): { pbcId: string; wiringVersion: string; registryVersion: string }[] {
  return wiringData.nodes
    .filter((n) => {
      const rv = getRegistryVersion(n.pbcId);
      return rv && rv !== (n as { version?: string }).version;
    })
    .map((n) => ({
      pbcId:           n.pbcId,
      wiringVersion:   (n as { version?: string }).version ?? "unknown",
      registryVersion: getRegistryVersion(n.pbcId) ?? "unknown",
    }));
}

export function buildNodes(): Node[] {
  return wiringData.nodes.map((n) => {
    const registryVersion = getRegistryVersion(n.pbcId);
    const wiringVersion = (n as { version?: string }).version ?? "unknown";
    const versionMismatch = registryVersion !== undefined && registryVersion !== wiringVersion;

    return {
      id: n.pbcId,
      type: "pbcNode",
      position: n.position,
      data: {
        pbcId:          n.pbcId,
        version:        wiringVersion,
        registryVersion,
        versionMismatch,
        displayName:    n.displayName,
        emits:          n.ports.emits,
        listens:        n.ports.listens,
        color:          versionMismatch ? "#ff4d4f" : (PBC_COLORS[n.pbcId] ?? DEFAULT_COLOR),
      } satisfies WiringNodeData & { registryVersion?: string; versionMismatch?: boolean },
      draggable:  true,
      selectable: true,
    };
  });
}

export function buildEdges(): Edge[] {
  return wiringData.edges.map((e) => ({
    id:           e.id,
    source:       e.source.pbcId,
    sourceHandle: e.source.portId,
    target:       e.target.pbcId,
    targetHandle: e.target.portId,
    type:         "wiringEdge",
    animated:     e.enabled,
    markerEnd:    { type: "arrowclosed" as const, width: 16, height: 16 },
    data: {
      description: e.description,
      autoWired:   e.autoWired,
      enabled:     e.enabled,
      transform:   e.transform,
    } satisfies WiringEdgeMeta,
  }));
}

export { wiringData };
