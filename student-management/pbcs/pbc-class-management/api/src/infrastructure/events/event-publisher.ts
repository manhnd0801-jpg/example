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
      clientId: this.config.get('KAFKA_CLIENT_ID', 'pbc-class-management'),
      brokers: this.config.getOrThrow<string>('KAFKA_BROKERS').split(','),
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() { await this.producer.connect(); }
  async onModuleDestroy() { await this.producer.disconnect(); }

  async publish(topic: string, data: Record<string, unknown>, tenantId: string, correlationId: string) {
    const envelope = { eventId: uuidv4(), eventType: topic, schemaVersion: '1.0', occurredAt: new Date().toISOString(), tenantId, correlationId: correlationId || uuidv4(), data };
    try {
      await this.producer.send({ topic, messages: [{ key: tenantId, value: JSON.stringify(envelope) }] });
    } catch (err) {
      this.logger.error(`Failed to publish ${topic}: ${(err as Error).message}`);
    }
  }
}
