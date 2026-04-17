// AI-GENERATED
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ClassStatus { ACTIVE = 'ACTIVE', COMPLETED = 'COMPLETED', PLANNED = 'PLANNED' }

@Entity('classes')
export class ClassEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column({ name: 'class_code', length: 20 }) classCode: string;
  @Column({ name: 'class_name', length: 255 }) className: string;
  @Column({ name: 'academic_year', length: 20 }) academicYear: string;
  @Column({ name: 'course_id', type: 'uuid', nullable: true }) courseId: string;
  @Column({ name: 'max_students', default: 30 }) maxStudents: number;
  @Column({ name: 'current_students', default: 0 }) currentStudents: number;
  @Column({ type: 'enum', enum: ClassStatus, default: ClassStatus.ACTIVE }) status: ClassStatus;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'tenant_id', length: 100 }) tenantId: string;
  @Column({ type: 'jsonb', default: '{}' }) attributes: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
