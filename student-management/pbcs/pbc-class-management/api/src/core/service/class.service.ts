// AI-GENERATED
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClassEntity } from '../domain/class.entity';
import { ClassStudentEntity } from '../domain/class-student.entity';
import { EventPublisher } from '../../infrastructure/events/event-publisher';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity) private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(ClassStudentEntity) private readonly csRepo: Repository<ClassStudentEntity>,
    private readonly eventPublisher: EventPublisher,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filter: any) {
    const { page = 1, pageSize = 20, tenantId } = filter;
    const [items, total] = await this.classRepo.findAndCount({
      where: { tenantId },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async findById(id: string, tenantId: string) {
    const cls = await this.classRepo.findOne({ where: { id, tenantId } });
    if (!cls) throw new NotFoundException(`Class ${id} not found`);
    return cls;
  }

  async create(data: Partial<ClassEntity>, tenantId: string, correlationId: string) {
    const cls = await this.classRepo.save({ ...data, tenantId, currentStudents: 0 });
    await this.eventPublisher.publish(
      'pbc.class-management.class.created',
      { classId: cls.id, classCode: cls.classCode, className: cls.className, academicYear: cls.academicYear, tenantId },
      tenantId, correlationId,
    );
    return cls;
  }

  async update(id: string, data: Partial<ClassEntity>, tenantId: string, correlationId: string) {
    const cls = await this.findById(id, tenantId);
    const updated = await this.classRepo.save({ ...cls, ...data, id });
    await this.eventPublisher.publish('pbc.class-management.class.updated', { classId: id, updatedFields: data, tenantId }, tenantId, correlationId);
    return updated;
  }

  async assignStudent(classId: string, studentId: string, tenantId: string, correlationId: string) {
    const cls = await this.findById(classId, tenantId);
    if (cls.currentStudents >= cls.maxStudents) {
      throw new ConflictException(`Class ${cls.classCode} is at maximum capacity (${cls.maxStudents})`);
    }
    await this.csRepo.save({ classId, studentId, tenantId, assignedDate: new Date(), status: 'ACTIVE' });
    await this.classRepo.increment({ id: classId }, 'currentStudents', 1);
    await this.eventPublisher.publish(
      'pbc.class-management.student.assigned-to-class',
      { classId, studentId, classCode: cls.classCode, className: cls.className, tenantId },
      tenantId, correlationId,
    );
  }

  async removeStudent(classId: string, studentId: string, tenantId: string, correlationId: string) {
    const cs = await this.csRepo.findOne({ where: { classId, studentId, tenantId } });
    if (!cs) throw new NotFoundException('Student not found in class');
    await this.csRepo.save({ ...cs, status: 'REMOVED', removedDate: new Date() });
    await this.classRepo.decrement({ id: classId }, 'currentStudents', 1);
    await this.eventPublisher.publish('pbc.class-management.student.removed-from-class', { classId, studentId, tenantId }, tenantId, correlationId);
  }

  async transferStudent(sourceClassId: string, studentId: string, targetClassId: string, tenantId: string, correlationId: string) {
    await this.dataSource.transaction(async (manager) => {
      const target = await manager.findOne(ClassEntity, { where: { id: targetClassId, tenantId } });
      if (!target) throw new NotFoundException(`Target class ${targetClassId} not found`);
      if (target.currentStudents >= target.maxStudents) throw new ConflictException('Target class is at maximum capacity');

      await manager.update(ClassStudentEntity, { classId: sourceClassId, studentId, tenantId }, { status: 'REMOVED', removedDate: new Date() });
      await manager.decrement(ClassEntity, { id: sourceClassId }, 'currentStudents', 1);
      await manager.save(ClassStudentEntity, { classId: targetClassId, studentId, tenantId, assignedDate: new Date(), status: 'ACTIVE' });
      await manager.increment(ClassEntity, { id: targetClassId }, 'currentStudents', 1);
    });
  }

  async getStudents(classId: string, tenantId: string) {
    return this.csRepo.find({ where: { classId, tenantId, status: 'ACTIVE' } });
  }
}
