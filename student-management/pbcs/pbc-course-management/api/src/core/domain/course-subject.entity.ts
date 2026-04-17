// AI-GENERATED
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('course_subjects')
export class CourseSubjectEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'course_id', type: 'uuid' }) courseId: string;
  @Column({ name: 'subject_id', type: 'uuid' }) subjectId: string;
  @Column({ default: 1 }) semester: number;
  @Column({ name: 'is_required', default: true }) isRequired: boolean;
  @Column({ name: 'order_index', default: 0 }) orderIndex: number;
  @Column({ name: 'tenant_id', length: 100 }) tenantId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
