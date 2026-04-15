// AI-GENERATED
// Map event giữa các PBC — không hard-code topic, đọc từ config
import { publish, subscribe } from "./event-bus";
import { TOPICS } from "../../../shared/shared-events";

export interface EventMapping {
  listenTopic: string;
  groupId: string;
  emitTopic: string;
  transform: (payload: unknown) => unknown;
}

const mappings: EventMapping[] = [
  {
    // Khi student-profile phát student-selected → shell forward sang enrollment-management
    listenTopic: TOPICS.UI_STUDENT_SELECTED,
    groupId: "app-shell-consumer-group",
    emitTopic: TOPICS.ENROLLMENT_PREFILL_REQUESTED,
    transform: (payload: unknown) => {
      const p = payload as { studentId: string; tenantId?: string };
      return { studentId: p.studentId, source: "student-profile", tenantId: p.tenantId };
    },
  },
];

export async function registerEventMappings(): Promise<void> {
  for (const mapping of mappings) {
    await subscribe(mapping.listenTopic, mapping.groupId, (payload) => {
      const transformed = mapping.transform(payload);
      publish(mapping.emitTopic, transformed).catch((err) =>
        console.error(`[event-mapper] Failed to publish to ${mapping.emitTopic}:`, err)
      );
    });
  }
}
