// app-shell/src/core/event-mapper.ts
//
// Vai trò: Lắng nghe event từ PBC nguồn → transform payload → publish sang PBC đích
// KHÔNG chứa logic nghiệp vụ — chỉ translate/forward event
// R-04: App Shell không hard-code logic nghiệp vụ
//
import { publish, subscribe } from "./event-bus";
import { EVENT_MAPPING } from "../config/event-mapping.config";
import { EVENTS } from "@shared/shared-events";
import type { EventAuthUserLoggedIn } from "@shared/shared-events";

export function initEventMapper(): void {
  // 1. Đăng ký Kafka event mappings từ config
  EVENT_MAPPING.forEach(({ source, targets }) => {
    subscribe(source.event, (payload: unknown) => {
      targets.forEach(({ event, transform }) => {
        const outgoing = transform ? transform(payload) : payload;
        publish(event, outgoing);
        console.debug(`[EventMapper] ${source.event} → ${event}`, outgoing);
      });
    });
  });

  // 2. Lắng nghe CustomEvent từ pbc-auth UI (window ↔ App Shell)
  //    pbc-auth UI dispatch "pbc-event" vì không có WebSocket trực tiếp
  window.addEventListener("pbc-event", (e: Event) => {
    const { topic, payload } = (e as CustomEvent<{ topic: string; payload: unknown }>).detail;

    switch (topic) {
      case "pbc.auth.user.logged-in": {
        // Map từ format cũ của pbc-auth sang EVENTS mới
        const p = payload as { userId?: string; username?: string; role?: string; id?: string };
        const normalized: EventAuthUserLoggedIn = {
          sub:          p.userId ?? p.id ?? "",
          name:         p.username ?? "",
          email:        "",
          roles:        p.role ? [p.role] : [],
          accessToken:  localStorage.getItem("accessToken") ?? "",
          refreshToken: localStorage.getItem("refreshToken") ?? "",
          expiresIn:    3600,
          // Legacy fields
          userId:   p.userId ?? p.id,
          username: p.username,
          role:     p.role,
        };
        sessionStorage.setItem("currentUser", JSON.stringify(p));
        window.dispatchEvent(new CustomEvent("shell:user-changed", { detail: p }));
        // Forward lên event bus để token-manager và session-context nhận
        publish(EVENTS.AUTH.USER_LOGGED_IN, normalized);
        break;
      }
      case "pbc.auth.user.logged-out": {
        sessionStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new CustomEvent("shell:user-changed", { detail: null }));
        publish(EVENTS.AUTH.USER_LOGGED_OUT, { sub: "", reason: "manual" as const });
        window.location.href = "/login";
        break;
      }
      default:
        // Forward lên Kafka nếu cần
        publish(topic, payload);
    }
  });
}
