// AI-GENERATED
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { NotificationService } from '../../core/service/notification.service';

const SUBSCRIBED_TOPICS = [
  'pbc.auth.user.logged-in',
  'pbc.auth.user.logged-out',
  'pbc.auth.user.created',
  'pbc.auth.user.role-changed',
  'pbc.student-management.student.created',
  'pbc.student-management.student.updated',
  'pbc.student-management.student.deleted',
  'pbc.student-management.student.status-changed',
  'pbc.class-management.class.created',
  'pbc.class-management.class.updated',
  'pbc.class-management.student.assigned-to-class',
  'pbc.class-management.student.removed-from-class',
  'pbc.course-management.course.created',
  'pbc.course-management.course.updated',
  'pbc.course-management.course.deleted',
  'pbc.subject-management.subject.created',
  'pbc.subject-management.subject.updated',
  'pbc.subject-management.subject.assigned-to-class',
  'pbc.subject-management.subject.assigned-to-course',
];

@Injectable()
export class EventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumer.name);
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly notificationService: NotificationService,
  ) {
    const kafka = new Kafka({
      clientId: this.config.get('KAFKA_CLIENT_ID', 'pbc-notification'),
      brokers: this.config.getOrThrow<string>('KAFKA_BROKERS').split(','),
    });
    this.consumer = kafka.consumer({ groupId: this.config.get('KAFKA_CONSUMER_GROUP', 'cg.notification') });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: SUBSCRIBED_TOPICS, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const envelope = JSON.parse(message.value?.toString() || '{}');
          await this.notificationService.processEvent(topic, envelope);
          this.logger.debug(`Processed event: ${topic}`);
        } catch (err) {
          this.logger.error(`Error processing ${topic}: ${(err as Error).message}`);
        }
      },
    });
    this.logger.log(`Kafka consumer started, subscribed to ${SUBSCRIBED_TOPICS.length} topics`);
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
