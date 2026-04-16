// AI-GENERATED
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { StudentService } from '../../core/service/student.service';

@Injectable()
export class EventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumer.name);
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly studentService: StudentService,
  ) {
    const kafka = new Kafka({
      clientId: this.config.get('KAFKA_CLIENT_ID', 'pbc-student-management'),
      brokers: this.config.getOrThrow<string>('KAFKA_BROKERS').split(','),
    });
    this.consumer = kafka.consumer({
      groupId: this.config.get('KAFKA_CONSUMER_GROUP', 'cg.student-mgmt'),
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['pbc.class-management.student.assigned-to-class', 'pbc.auth.user.created'],
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
    const { data, tenantId } = envelope;

    if (topic === 'pbc.class-management.student.assigned-to-class') {
      await this.studentService.handleClassAssigned(data.studentId, data.classId, tenantId);
      this.logger.debug(`Updated classId for student ${data.studentId}`);
    }

    if (topic === 'pbc.auth.user.created') {
      const userId = data?.userId as string | undefined;
      const username = data?.username as string | undefined;
      const email = data?.email as string | undefined;

      if (!tenantId || !userId) return;

      const result = await this.studentService.linkAuthUserCreated({ userId, username, email }, tenantId);
      if (!result.linked) {
        this.logger.debug(`No student matched for user.created userId=${userId}`);
        return;
      }
      this.logger.debug(`Linked userId=${userId} to studentId=${result.studentId}`);
    }
  }
}
