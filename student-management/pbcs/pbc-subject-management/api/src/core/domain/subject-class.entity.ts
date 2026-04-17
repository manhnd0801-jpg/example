// AI-GENERATED
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('subject_classes')
export class SubjectClassEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'subject_id', type: 'uuid' }) subjectId: string;
  @Column({ name: 'class_id', type: 'uuid' }) classId: string;
  @Column({ default: 1 }) semester: number;
  @Column({ name: 'teacher_id', type: 'uuid', nullable: true }) teacherId: string;
  @Column({ nullable: true }) schedule: string;
  @Column({ nullable: true }) room: string;
  @Column({ default: 'ACTIVE' }) status: string;
  @Column({ name: 'tenant_id', length: 100 }) tenantId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
