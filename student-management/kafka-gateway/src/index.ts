// kafka-gateway/src/index.ts
// WebSocket bridge: Browser ↔ Kafka
// Browser không connect trực tiếp Kafka — phải qua gateway này (R-03a)
import { WebSocketServer, WebSocket } from "ws";
import { createKafkaClient } from "./kafka-client";
import { handleWsMessage } from "./ws-handler";
import { ALLOWED_TOPICS } from "./topic-registry";

const PORT = parseInt(process.env.GATEWAY_PORT ?? "4000");
const wss = new WebSocketServer({ port: PORT });

async function bootstrap() {
  const kafka = await createKafkaClient();
  console.info(`[KafkaGateway] WebSocket server listening on ws://0.0.0.0:${PORT}`);

  wss.on("connection", (ws: WebSocket, req) => {
    const clientIp = req.socket.remoteAddress;
    console.info(`[KafkaGateway] Client connected: ${clientIp}`);

    // Mỗi connection có một clientId riêng để tạo consumer group độc lập
    const clientId = crypto.randomUUID();
    handleWsMessage(ws, kafka, clientId, ALLOWED_TOPICS);

    ws.on("close", () => {
      console.info(`[KafkaGateway] Client disconnected: ${clientIp} (${clientId})`);
    });
  });
}

bootstrap().catch((err) => {
  console.error("[KafkaGateway] Fatal error:", err);
  process.exit(1);
});
