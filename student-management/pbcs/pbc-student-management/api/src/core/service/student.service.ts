// AI-GENERATED
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { StudentRepository } from '../repository/student.repository';
import { StudentEntity, StudentStatus } from '../domain/student.entity';
import { EventPublisher } from '../../infrastructure/events/event-publisher';
import { v4 as uuidv4 } from 'uuid';

const VALID_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  [StudentStatus.ACTIVE]: [StudentStatus.SUSPENDED, StudentStatus.GRADUATED, StudentStatus.DROPPED_OUT],
  [StudentStatus.SUSPENDED]: [StudentStatus.ACTIVE],
  [StudentStatus.GRADUATED]: [],
  [StudentStatus.DROPPED_OUT]: [],
};

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async linkAuthUserCreated(
    input: { userId: string; username?: string; email?: string },
    tenantId: string,
  ): Promise<{ linked: boolean; studentId?: string }> {
    const normalizedEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : undefined;
    const normalizedUsername = typeof input.username === 'string' ? input.username.trim() : undefined;

    let student = normalizedEmail
      ? await this.studentRepo.findByEmail(normalizedEmail, tenantId)
      : undefined;

    if (!student && normalizedUsername) {
      student = await this.studentRepo.findByCode(normalizedUsername, tenantId);
    }

    if (!student) return { linked: false };

    const attributes = (student.attributes || {}) as Record<string, unknown>;
    if (attributes.userId === input.userId) {
      return { linked: true, studentId: student.id };
    }

    attributes.userId = input.userId;
    if (normalizedUsername) attributes.username = normalizedUsername;
    if (normalizedEmail) attributes.email = normalizedEmail;

    await this.studentRepo.save({ id: student.id, tenantId, attributes });

    return { linked: true, studentId: student.id };
  }

  async findAll(filter: any) {
    return this.studentRepo.findAll(filter);
  }

  async findById(id: string, tenantId: string) {
    const student = await this.studentRepo.findById(id, tenantId);
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  async create(data: Partial<StudentEntity>, tenantId: string, correlationId: string) {
    const studentCode = await this.studentRepo.generateStudentCode(tenantId);
    const student = await this.studentRepo.save({ ...data, studentCode, tenantId });

    await this.eventPublisher.publish(
      'pbc.student-management.student.created',
      { studentId: student.id, studentCode: student.studentCode, fullName: student.fullName, classId: student.classId, tenantId },
      tenantId,
      correlationId,
    );

    return student;
  }

  async update(id: string, data: Partial<StudentEntity>, tenantId: string, correlationId: string) {
    const student = await this.findById(id, tenantId);
    const updated = await this.studentRepo.save({ ...student, ...data, id });

    await this.eventPublisher.publish(
      'pbc.student-management.student.updated',
      { studentId: id, updatedFields: data, tenantId },
      tenantId,
      correlationId,
    );

    return updated;
  }

  async remove(id: string, tenantId: string, correlationId: string) {
    const student = await this.findById(id, tenantId);
    await this.studentRepo.softDelete(id, tenantId);

    await this.eventPublisher.publish(
      'pbc.student-management.student.deleted',
      { studentId: id, studentCode: student.studentCode, tenantId },
      tenantId,
      correlationId,
    );
  }

  async changeStatus(id: string, newStatus: StudentStatus, tenantId: string, correlationId: string) {
    const student = await this.findById(id, tenantId);
    const allowed = VALID_TRANSITIONS[student.status];

    if (!allowed.includes(newStatus)) {
      throw new UnprocessableEntityException(
        `Invalid status transition: ${student.status} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    const oldStatus = student.status;
    const updated = await this.studentRepo.save({ ...student, status: newStatus });

    await this.eventPublisher.publish(
      'pbc.student-management.student.status-changed',
      { studentId: id, oldStatus, newStatus, tenantId },
      tenantId,
      correlationId,
    );

    return updated;
  }

  async handleClassAssigned(studentId: string, classId: string, tenantId: string) {
    const student = await this.studentRepo.findById(studentId, tenantId);
    if (student) {
      await this.studentRepo.save({ ...student, classId });
    }
  }
}
