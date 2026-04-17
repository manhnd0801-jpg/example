// kafka-gateway/src/ws-handler.ts
import { WebSocket } from "ws";
import { KafkaClient } from "./kafka-client";
import { Consumer } from "kafkajs";

interface WsMessage {
  type: "publish" | "subscribe" | "unsubscribe";
  topic: string;
  payload?: unknown;
}

export function handleWsMessage(
  ws: WebSocket,
  { kafka, producer }: KafkaClient,
  clientId: string,
  allowedTopics: string[],
): void {
  // Map topic → consumer (mỗi subscription 1 consumer)
  const consumers = new Map<string, Consumer>();

  ws.on("message", async (raw) => {
    let msg: WsMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      console.warn("[KafkaGateway] Invalid JSON from client:", clientId);
      return;
    }

    // Whitelist check — không cho publish/subscribe topic tự do
    if (!allowedTopics.includes(msg.topic)) {
      console.warn(`[KafkaGateway] Blocked topic: ${msg.topic} from ${clientId}`);
      return;
    }

    switch (msg.type) {
      case "publish": {
        await producer.send({
          topic: msg.topic,
          messages: [{ value: JSON.stringify(msg.payload), key: clientId }],
        });
        break;
      }

      case "subscribe": {
        if (consumers.has(msg.topic)) return; // Đã subscribe rồi
        const consumer = kafka.consumer({
          groupId: `gateway-${clientId}-${msg.topic}`,
        });
        await consumer.connect();
        await consumer.subscribe({ topic: msg.topic, fromBeginning: false });
        await consumer.run({
          eachMessage: async ({ message }) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "event",
                  topic: msg.topic,
                  payload: JSON.parse(message.value?.toString() ?? "null"),
                }),
              );
            }
          },
        });
        consumers.set(msg.topic, consumer);
        console.debug(`[KafkaGateway] ${clientId} subscribed: ${msg.topic}`);
        break;
      }

      case "unsubscribe": {
        const consumer = consumers.get(msg.topic);
        if (consumer) {
          await consumer.disconnect();
          consumers.delete(msg.topic);
        }
        break;
      }
    }
  });

  ws.on("close", async () => {
    // Cleanup tất cả consumer khi client disconnect
    for (const [topic, consumer] of consumers) {
      await consumer.disconnect().catch(() => {});
      console.debug(`[KafkaGateway] Cleaned up consumer for ${clientId}:${topic}`);
    }
    consumers.clear();
  });
}
