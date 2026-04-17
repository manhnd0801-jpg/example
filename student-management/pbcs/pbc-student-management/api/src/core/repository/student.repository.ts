// AI-GENERATED
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../domain/student.entity';

export interface StudentFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  classId?: string;
  status?: string;
  courseId?: string;
  tenantId: string;
}

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repo: Repository<StudentEntity>,
  ) {}

  async findAll(filter: StudentFilter) {
    const { page = 1, pageSize = 20, search, classId, status, tenantId } = filter;
    const qb = this.repo.createQueryBuilder('s')
      .where('s.tenant_id = :tenantId', { tenantId })
      .andWhere('s.deleted_at IS NULL');

    if (search) {
      qb.andWhere('(s.full_name ILIKE :search OR s.student_code ILIKE :search)', { search: `%${search}%` });
    }
    if (classId) qb.andWhere('s.class_id = :classId', { classId });
    if (status) qb.andWhere('s.status = :status', { status });

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findById(id: string, tenantId: string) {
    return this.repo.findOne({ where: { id, tenantId } });
  }

  async findByCode(studentCode: string, tenantId: string) {
    return this.repo.findOne({ where: { studentCode, tenantId } });
  }

  async findByEmail(email: string, tenantId: string) {
    return this.repo.findOne({ where: { email, tenantId } });
  }

  async save(entity: Partial<StudentEntity>) {
    return this.repo.save(entity);
  }

  async softDelete(id: string, tenantId: string) {
    await this.repo.softDelete({ id, tenantId });
  }

  async generateStudentCode(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repo.count({ where: { tenantId } });
    return `STU${year}${String(count + 1).padStart(4, '0')}`;
  }
}
