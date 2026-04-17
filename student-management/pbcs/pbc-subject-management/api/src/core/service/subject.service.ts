// AI-GENERATED
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectEntity } from '../domain/subject.entity';
import { SubjectClassEntity } from '../domain/subject-class.entity';
import { EventPublisher } from '../../infrastructure/events/event-publisher';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(SubjectEntity) private readonly subjectRepo: Repository<SubjectEntity>,
    @InjectRepository(SubjectClassEntity) private readonly scRepo: Repository<SubjectClassEntity>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async findAll(filter: any) {
    const { page = 1, pageSize = 20, tenantId, subjectType } = filter;
    const where: any = { tenantId };
    if (subjectType) where.subjectType = subjectType;
    const [items, total] = await this.subjectRepo.findAndCount({ where, skip: (page - 1) * pageSize, take: pageSize });
    return { items, total, page, pageSize };
  }

  async findById(id: string, tenantId: string) {
    const subject = await this.subjectRepo.findOne({ where: { id, tenantId } });
    if (!subject) throw new NotFoundException(`Subject ${id} not found`);
    return subject;
  }

  async create(data: Partial<SubjectEntity>, tenantId: string, correlationId: string) {
    const totalCredits = (data.theoryCredits || 0) + (data.practiceCredits || 0);
    const subject = await this.subjectRepo.save({ ...data, totalCredits, tenantId });
    await this.eventPublisher.publish(
      'pbc.subject-management.subject.created',
      { subjectId: subject.id, subjectCode: subject.subjectCode, subjectName: subject.subjectName, credits: subject.totalCredits, tenantId },
      tenantId, correlationId,
    );
    return subject;
  }

  async update(id: string, data: Partial<SubjectEntity>, tenantId: string, correlationId: string) {
    const subject = await this.findById(id, tenantId);
    const theoryCredits = data.theoryCredits ?? subject.theoryCredits;
    const practiceCredits = data.practiceCredits ?? subject.practiceCredits;
    const totalCredits = theoryCredits + practiceCredits;
    const updated = await this.subjectRepo.save({ ...subject, ...data, totalCredits, id });
    await this.eventPublisher.publish('pbc.subject-management.subject.updated', { subjectId: id, updatedFields: data, tenantId }, tenantId, correlationId);
    return updated;
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    const assignments = await this.scRepo.count({ where: { subjectId: id, tenantId } });
    if (assignments > 0) throw new ConflictException('Cannot delete subject with active class assignments');
    await this.subjectRepo.delete({ id, tenantId });
  }

  async assignToClass(subjectId: string, data: Partial<SubjectClassEntity>, tenantId: string, correlationId: string) {
    const existing = await this.scRepo.findOne({ where: { subjectId, classId: data.classId, tenantId } });
    if (existing) throw new ConflictException('Subject already assigned to this class');
    const assignment = await this.scRepo.save({ ...data, subjectId, tenantId });
    await this.eventPublisher.publish(
      'pbc.subject-management.subject.assigned-to-class',
      { subjectId, classId: data.classId, semester: data.semester, teacherId: data.teacherId, tenantId },
      tenantId, correlationId,
    );
    return assignment;
  }

  async assignToCourse(subjectId: string, data: any, tenantId: string, correlationId: string) {
    await this.eventPublisher.publish(
      'pbc.subject-management.subject.assigned-to-course',
      { subjectId, courseId: data.courseId, semesterId: data.semesterId, isRequired: data.isRequired, tenantId },
      tenantId, correlationId,
    );
    return { subjectId, ...data };
  }
}
