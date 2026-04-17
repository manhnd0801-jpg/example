// AI-GENERATED
// Wrap Kafka client — graceful khi broker không available
import { Kafka, Producer, Consumer, EachMessagePayload } from "kafkajs";

let producer: Producer | null = null;
let kafka: Kafka | null = null;
let connected = false;

export async function initEventBus(brokers: string): Promise<void> {
  kafka = new Kafka({
    clientId: "app-shell-student-management",
    brokers: brokers.split(","),
    retry: { retries: 3, initialRetryTime: 300 },
  });

  producer = kafka.producer();
  try {
    await producer.connect();
    connected = true;
    console.log(`[event-bus] Kafka producer connected to ${brokers}`);
  } catch (err) {
    connected = false;
    console.warn(`[event-bus] Kafka not available, events will be dropped: ${(err as Error).message}`);
  }
}

export async function publish(topic: string, payload: unknown): Promise<void> {
  if (!producer || !connected) {
    console.warn(`[event-bus] Skipping publish to ${topic} — Kafka not connected`);
    return;
  }
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
}

export async function subscribe(
  topic: string,
  groupId: string,
  handler: (payload: unknown) => void
): Promise<void> {
  if (!kafka || !connected) {
    console.warn(`[event-bus] Skipping subscribe to ${topic} — Kafka not connected`);
    return;
  }

  const consumer: Consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      try {
        const raw = message.value?.toString();
        if (raw) handler(JSON.parse(raw));
      } catch (err) {
        console.error(`[event-bus] Error handling topic ${topic}:`, err);
      }
    },
  });
}

export async function closeEventBus(): Promise<void> {
  await producer?.disconnect();
}
