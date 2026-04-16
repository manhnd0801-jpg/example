// AI-GENERATED
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../domain/course.entity';
import { CourseSubjectEntity } from '../domain/course-subject.entity';
import { EventPublisher } from '../../infrastructure/events/event-publisher';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity) private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(CourseSubjectEntity) private readonly csRepo: Repository<CourseSubjectEntity>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async findAll(filter: any) {
    const { page = 1, pageSize = 20, tenantId, status } = filter;
    const where: any = { tenantId };
    if (status) where.status = status;
    const [items, total] = await this.courseRepo.findAndCount({ where, skip: (page - 1) * pageSize, take: pageSize });
    return { items, total, page, pageSize };
  }

  async findById(id: string, tenantId: string) {
    const course = await this.courseRepo.findOne({ where: { id, tenantId } });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async create(data: Partial<CourseEntity>, tenantId: string, correlationId: string) {
    const course = await this.courseRepo.save({ ...data, tenantId });
    await this.eventPublisher.publish('pbc.course-management.course.created', { courseId: course.id, courseCode: course.courseCode, courseName: course.courseName, tenantId }, tenantId, correlationId);
    return course;
  }

  async update(id: string, data: Partial<CourseEntity>, tenantId: string, correlationId: string) {
    const course = await this.findById(id, tenantId);
    const updated = await this.courseRepo.save({ ...course, ...data, id });
    await this.eventPublisher.publish('pbc.course-management.course.updated', { courseId: id, updatedFields: data, tenantId }, tenantId, correlationId);
    return updated;
  }

  async remove(id: string, tenantId: string, correlationId: string) {
    await this.findById(id, tenantId);
    await this.courseRepo.delete({ id, tenantId });
    await this.eventPublisher.publish('pbc.course-management.course.deleted', { courseId: id, tenantId }, tenantId, correlationId);
  }

  async getSubjects(courseId: string, tenantId: string) {
    return this.csRepo.find({ where: { courseId, tenantId } });
  }

  async addSubject(courseId: string, data: Partial<CourseSubjectEntity>, tenantId: string) {
    const existing = await this.csRepo.findOne({ where: { courseId, subjectId: data.subjectId, tenantId } });
    if (existing) throw new ConflictException('Subject already assigned to this course');
    return this.csRepo.save({ ...data, courseId, tenantId });
  }

  async removeSubject(courseId: string, subjectId: string, tenantId: string) {
    await this.csRepo.delete({ courseId, subjectId, tenantId });
  }
}
