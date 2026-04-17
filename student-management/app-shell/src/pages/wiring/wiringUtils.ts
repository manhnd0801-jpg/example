// Wiring canvas — utilities
// Convert app-wiring.json → React Flow nodes/edges
import type { Node, Edge } from "@xyflow/react";
import wiringData from "../../../../app-wiring.json";
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

export function buildNodes(): Node[] {
  return wiringData.nodes.map((n) => ({
    id: n.pbcId,
    type: "pbcNode",
    position: n.position,
    data: {
      pbcId:       n.pbcId,
      displayName: n.displayName,
      emits:       n.ports.emits,
      listens:     n.ports.listens,
      color:       PBC_COLORS[n.pbcId] ?? DEFAULT_COLOR,
    } satisfies WiringNodeData,
    // Không cho resize, chỉ drag
    draggable: true,
    selectable: true,
  }));
}

export function buildEdges(): Edge[] {
  return wiringData.edges.map((e) => ({
    id: e.id,
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
