// AI-GENERATED
// Wrap Kafka client — không chứa logic nghiệp vụ
import { Kafka, Producer, Consumer, EachMessagePayload } from "kafkajs";

let producer: Producer | null = null;
let kafka: Kafka | null = null;

export async function initEventBus(brokers: string): Promise<void> {
  kafka = new Kafka({
    clientId: "app-shell-student-management",
    brokers: brokers.split(","),
  });

  producer = kafka.producer();
  await producer.connect();
  console.log(`[event-bus] Kafka producer connected to ${brokers}`);
}

export async function publish(topic: string, payload: unknown): Promise<void> {
  if (!producer) throw new Error("[event-bus] Kafka producer not initialized");
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
  if (!kafka) throw new Error("[event-bus] Kafka not initialized");

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
