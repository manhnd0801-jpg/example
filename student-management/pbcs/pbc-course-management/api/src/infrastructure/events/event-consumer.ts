// AI-GENERATED
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumer, Kafka } from 'kafkajs';
import { Repository } from 'typeorm';
import { CourseSubjectEntity } from '../../core/domain/course-subject.entity';

@Injectable()
export class EventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumer.name);
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(CourseSubjectEntity) private readonly csRepo: Repository<CourseSubjectEntity>,
  ) {
    const kafka = new Kafka({
      clientId: this.config.get('KAFKA_CLIENT_ID', 'pbc-course-management'),
      brokers: this.config.getOrThrow<string>('KAFKA_BROKERS').split(','),
    });
    this.consumer = kafka.consumer({
      groupId: this.config.get('KAFKA_CONSUMER_GROUP', 'cg.course-mgmt'),
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['pbc.subject-management.subject.assigned-to-course'],
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

    if (topic === 'pbc.subject-management.subject.assigned-to-course') {
      const courseId = data?.courseId;
      const subjectId = data?.subjectId;
      if (!courseId || !subjectId || !tenantId) return;

      const semester = typeof data?.semester === 'number' ? data.semester : data?.semesterId;
      const isRequired = data?.isRequired ?? true;

      const existing = await this.csRepo.findOne({ where: { courseId, subjectId, tenantId } });
      if (existing) return;

      await this.csRepo.save({
        courseId,
        subjectId,
        semester: typeof semester === 'number' ? semester : 1,
        isRequired: Boolean(isRequired),
        orderIndex: 0,
        tenantId,
      });

      this.logger.debug(`Linked subject ${subjectId} to course ${courseId}`);
    }
  }
}
