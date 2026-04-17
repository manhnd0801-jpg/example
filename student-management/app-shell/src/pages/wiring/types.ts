// Wiring canvas — shared types
// Map từ app-wiring.json sang React Flow format

export interface WiringPort {
  id: string;
  topic: string;
  label: string;
}

export interface WiringNodeData {
  pbcId: string;
  displayName: string;
  emits: WiringPort[];
  listens: WiringPort[];
  color: string;
}

export interface WiringEdgeMeta {
  description: string;
  autoWired: boolean;
  enabled: boolean;
  transform: { type: string; fields?: string[] } | null;
}
