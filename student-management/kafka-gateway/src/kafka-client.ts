// kafka-gateway/src/kafka-client.ts
import { Kafka, Producer, Admin } from "kafkajs";
import { ALLOWED_TOPICS } from "./topic-registry";

export interface KafkaClient {
  producer: Producer;
  kafka: Kafka;
}

export async function createKafkaClient(): Promise<KafkaClient> {
  const kafka = new Kafka({
    clientId: "kafka-gateway",
    brokers: (process.env.KAFKA_BROKERS ?? "kafka:9092").split(","),
    retry: { retries: 5, initialRetryTime: 300 },
  });

  const admin: Admin = kafka.admin();
  await admin.connect();

  // Tự động tạo topic nếu chưa có
  const existingTopics = await admin.listTopics();
  const toCreate = ALLOWED_TOPICS.filter((t) => !existingTopics.includes(t));
  if (toCreate.length > 0) {
    await admin.createTopics({
      topics: toCreate.map((topic) => ({
        topic,
        numPartitions: parseInt(process.env.KAFKA_NUM_PARTITIONS ?? "6"),
        replicationFactor: parseInt(process.env.KAFKA_REPLICATION_FACTOR ?? "1"),
      })),
    });
    console.info("[KafkaGateway] Created topics:", toCreate);
  }
  await admin.disconnect();

  const producer = kafka.producer();
  await producer.connect();
  console.info("[KafkaGateway] Kafka producer connected");

  return { kafka, producer };
}
