// AI-GENERATED
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventPublisher.name);
  private producer: Producer;

  constructor(private readonly config: ConfigService) {
    const kafka = new Kafka({
      clientId: this.config.get('KAFKA_CLIENT_ID', 'pbc-subject-management-api'),
      brokers: this.config.getOrThrow<string>('KAFKA_BROKERS').split(','),
      retry: { retries: 3, initialRetryTime: 300, factor: 2 },
    });
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected');
    } catch (err) {
      this.logger.warn(`Kafka producer failed to connect: ${(err as Error).message}. Events will be dropped until Kafka is available.`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish(topic: string, data: Record<string, unknown>, tenantId: string, correlationId: string): Promise<void> {
    const envelope = { eventId: uuidv4(), eventType: topic, schemaVersion: '1.0', occurredAt: new Date().toISOString(), tenantId, correlationId: correlationId || uuidv4(), data };
    try {
      await this.producer.send({ topic, messages: [{ key: tenantId, value: JSON.stringify(envelope), headers: { 'X-Tenant-Id': tenantId, 'X-Correlation-Id': correlationId } }] });
      this.logger.debug(`Published event ${topic} [correlationId=${correlationId}]`);
    } catch (err) {
      this.logger.error(`Failed to publish event ${topic}: ${(err as Error).message}`, err);
    }
  }
}
