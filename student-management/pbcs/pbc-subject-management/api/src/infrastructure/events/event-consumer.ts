// AI-GENERATED
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';

@Injectable()
export class EventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumer.name);
  private consumer: Consumer;

  constructor(private readonly config: ConfigService) {
    const kafka = new Kafka({
      clientId: this.config.get('KAFKA_CLIENT_ID', 'pbc-subject-management'),
      brokers: this.config.getOrThrow<string>('KAFKA_BROKERS').split(','),
    });
    this.consumer = kafka.consumer({
      groupId: this.config.get('KAFKA_CONSUMER_GROUP', 'cg.subject-mgmt'),
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['pbc.course-management.course.created'],
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const envelope = JSON.parse(message.value?.toString() || '{}');
          await this.handleEvent(topic, envelope);
        } catch (err) {
          this.logger.error(`Error processing message from ${topic}: ${(err as Error).message}`);
        }
      },
    });

    this.logger.log('Kafka consumer started');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async handleEvent(topic: string, envelope: any) {
    if (topic === 'pbc.course-management.course.created') {
      const { data } = envelope;
      this.logger.debug(`Received course.created courseId=${data?.courseId}`);
    }
  }
}
