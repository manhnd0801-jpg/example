// AI-GENERATED
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumer, Kafka } from 'kafkajs';
import { Repository } from 'typeorm';
import { ClassStudentEntity } from '../../core/domain/class-student.entity';
import { ClassEntity } from '../../core/domain/class.entity';

@Injectable()
export class EventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumer.name);
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(ClassStudentEntity) private readonly csRepo: Repository<ClassStudentEntity>,
    @InjectRepository(ClassEntity) private readonly classRepo: Repository<ClassEntity>,
  ) {
    const kafka = new Kafka({
      clientId: this.config.get('KAFKA_CLIENT_ID', 'pbc-class-management'),
      brokers: this.config.getOrThrow<string>('KAFKA_BROKERS').split(','),
    });
    this.consumer = kafka.consumer({
      groupId: this.config.get('KAFKA_CONSUMER_GROUP', 'cg.class-mgmt'),
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: [
        'pbc.student-management.student.created',
        'pbc.student-management.student.deleted',
        'pbc.student-management.student.status-changed',
        'pbc.subject-management.subject.assigned-to-class',
      ],
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

    if (topic === 'pbc.student-management.student.created') {
      this.logger.debug(`Received student.created studentId=${data?.studentId}`);
      return;
    }

    if (topic === 'pbc.student-management.student.deleted') {
      const studentId = data?.studentId;
      if (!studentId || !tenantId) return;

      const activeLinks = await this.csRepo.find({ where: { studentId, tenantId, status: 'ACTIVE' } });
      for (const link of activeLinks) {
        await this.csRepo.save({ ...link, status: 'REMOVED', removedDate: new Date() });
        await this.classRepo.decrement({ id: link.classId }, 'currentStudents', 1);
      }
      this.logger.debug(`Removed student ${studentId} from ${activeLinks.length} classes`);
      return;
    }

    if (topic === 'pbc.student-management.student.status-changed') {
      const studentId = data?.studentId;
      const newStatus = data?.newStatus;
      if (!studentId || !tenantId) return;

      if (newStatus === 'DROPPED_OUT' || newStatus === 'GRADUATED') {
        const activeLinks = await this.csRepo.find({ where: { studentId, tenantId, status: 'ACTIVE' } });
        for (const link of activeLinks) {
          await this.csRepo.save({ ...link, status: 'REMOVED', removedDate: new Date() });
          await this.classRepo.decrement({ id: link.classId }, 'currentStudents', 1);
        }
        this.logger.debug(`Auto-removed student ${studentId} due to status=${newStatus}`);
      }
      return;
    }

    if (topic === 'pbc.subject-management.subject.assigned-to-class') {
      const classId = data?.classId;
      const subjectId = data?.subjectId;
      if (!classId || !subjectId || !tenantId) return;

      const cls = await this.classRepo.findOne({ where: { id: classId, tenantId } });
      if (!cls) return;

      const attributes = (cls.attributes || {}) as Record<string, unknown>;
      const current = Array.isArray(attributes.subjectIds) ? (attributes.subjectIds as unknown[]) : [];
      if (!current.includes(subjectId)) {
        attributes.subjectIds = [...current, subjectId];
        await this.classRepo.save({ ...cls, attributes });
      }

      this.logger.debug(`Updated class ${classId} attributes.subjectIds += ${subjectId}`);
    }
  }
}
