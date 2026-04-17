// AI-GENERATED
// Map event giữa các PBC + lắng nghe auth events từ pbc-auth UI
import { publish, subscribe } from "./event-bus";

export interface EventMapping {
  listenTopic: string;
  groupId: string;
  emitTopic: string;
  transform: (payload: unknown) => unknown;
}

// Kafka topic mappings giữa các PBC
const kafkaMappings: EventMapping[] = [
  {
    listenTopic: "app.student-management.ui.student-selected",
    groupId: "app-shell-consumer-group",
    emitTopic: "pbc.enrollment-management.enrollment.prefill-requested",
    transform: (payload: unknown) => {
      const p = payload as { studentId: string; tenantId?: string };
      return { studentId: p.studentId, source: "student-profile", tenantId: p.tenantId };
    },
  },
];

export async function registerEventMappings(): Promise<void> {
  // 1. Đăng ký Kafka topic mappings
  for (const mapping of kafkaMappings) {
    await subscribe(mapping.listenTopic, mapping.groupId, (payload) => {
      const transformed = mapping.transform(payload);
      publish(mapping.emitTopic, transformed).catch((err) =>
        console.error(`[event-mapper] Failed to publish to ${mapping.emitTopic}:`, err)
      );
    });
  }

  // 2. Lắng nghe CustomEvent từ pbc-auth UI (window ↔ App Shell)
  window.addEventListener("pbc-event", (e: Event) => {
    const { topic, payload } = (e as CustomEvent<{ topic: string; payload: unknown }>).detail;

    switch (topic) {
      case "pbc.auth.user.logged-in": {
        const p = payload as { userId: string; username: string; role: string };
        sessionStorage.setItem("currentUser", JSON.stringify(p));
        // Dispatch event để Shell re-render với user info
        window.dispatchEvent(new CustomEvent("shell:user-changed", { detail: p }));
        break;
      }
      case "pbc.auth.user.logged-out": {
        sessionStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new CustomEvent("shell:user-changed", { detail: null }));
        window.location.href = "/login";
        break;
      }
      default:
        // Forward lên Kafka nếu cần
        publish(topic, payload).catch(() => {});
    }
  });
}
