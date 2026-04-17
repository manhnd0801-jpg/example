// app-shell/src/core/event-bus.ts
//
// Browser không connect trực tiếp Kafka — phải qua kafka-gateway (WebSocket bridge)
// R-12: KafkaJS không chạy được trong browser
// Interface publish/subscribe giữ nguyên để các module khác không đổi
//
import { ENV } from "../config/env";

// ── Types ──────────────────────────────────────────────────────────────────
type MessageHandler = (payload: unknown) => void;

interface GatewayMessage {
  type: "publish" | "event";
  topic: string;
  payload: unknown;
}

// ── Internal State ──────────────────────────────────────────────────────────
let ws: WebSocket | null = null;
let isConnected = false;
const subscriptions = new Map<string, Set<MessageHandler>>();
const pendingPublish: GatewayMessage[] = []; // Buffer khi chưa connect

// ── Subscription Handle ────────────────────────────────────────────────────
export interface Subscription {
  unsubscribe: () => void;
}

// ── Connect ─────────────────────────────────────────────────────────────────
export async function connectEventBus(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ENV.KAFKA_GATEWAY_URL) {
      console.warn("[EventBus] KAFKA_GATEWAY_URL không được cấu hình — event bus disabled");
      resolve();
      return;
    }

    ws = new WebSocket(ENV.KAFKA_GATEWAY_URL);

    ws.onopen = () => {
      isConnected = true;
      console.info("[EventBus] Connected to kafka-gateway:", ENV.KAFKA_GATEWAY_URL);

      // Đăng ký lại tất cả topic sau khi reconnect
      subscriptions.forEach((_, topic) => _sendSubscribe(topic));

      // Flush buffer
      pendingPublish.splice(0).forEach((msg) => ws?.send(JSON.stringify(msg)));

      resolve();
    };

    ws.onmessage = (event) => {
      try {
        const msg: GatewayMessage = JSON.parse(event.data);
        if (msg.type === "event") {
          subscriptions.get(msg.topic)?.forEach((handler) => handler(msg.payload));
        }
      } catch (err) {
        console.error("[EventBus] Invalid message from gateway:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[EventBus] WebSocket error:", err);
      reject(err);
    };

    ws.onclose = (event) => {
      isConnected = false;
      console.warn(`[EventBus] Disconnected (code=${event.code}). Reconnecting in 3s...`);
      setTimeout(connectEventBus, 3000); // Auto-reconnect
    };
  });
}

// ── Publish ─────────────────────────────────────────────────────────────────
export function publish<T>(topic: string, payload: T): void {
  const msg: GatewayMessage = { type: "publish", topic, payload };
  if (isConnected && ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  } else {
    pendingPublish.push(msg); // Buffer — gửi sau khi reconnect
    console.warn(`[EventBus] Not connected — buffered publish: ${topic}`);
  }
}

// ── Subscribe ────────────────────────────────────────────────────────────────
export function subscribe<T>(
  topic: string,
  handler: (payload: T) => void,
): Subscription {
  if (!subscriptions.has(topic)) {
    subscriptions.set(topic, new Set());
    if (isConnected) _sendSubscribe(topic);
  }
  subscriptions.get(topic)!.add(handler as MessageHandler);

  return {
    unsubscribe: () => {
      subscriptions.get(topic)?.delete(handler as MessageHandler);
      if (subscriptions.get(topic)?.size === 0) {
        subscriptions.delete(topic);
        _sendUnsubscribe(topic);
      }
    },
  };
}

// ── Disconnect ───────────────────────────────────────────────────────────────
export async function disconnectEventBus(): Promise<void> {
  ws?.close(1000, "App shutdown");
  ws = null;
  isConnected = false;
  subscriptions.clear();
}

// ── Internal helpers ─────────────────────────────────────────────────────────
function _sendSubscribe(topic: string): void {
  ws?.send(JSON.stringify({ type: "subscribe", topic }));
}

function _sendUnsubscribe(topic: string): void {
  ws?.send(JSON.stringify({ type: "unsubscribe", topic }));
}
