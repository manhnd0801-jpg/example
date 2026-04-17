// AI-GENERATED
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index,
} from 'typeorm';

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  GRADUATED = 'GRADUATED',
  DROPPED_OUT = 'DROPPED_OUT',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'student_code', length: 20 })
  studentCode: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Column({ name: 'class_id', type: 'uuid', nullable: true })
  classId: string;

  @Column({ name: 'enrollment_date', type: 'date', nullable: true })
  enrollmentDate: Date;

  @Column({ name: 'graduation_date', type: 'date', nullable: true })
  graduationDate: Date;

  @Column({ name: 'tenant_id', length: 100 })
  tenantId: string;

  @Column({ type: 'jsonb', default: '{}' })
  attributes: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
