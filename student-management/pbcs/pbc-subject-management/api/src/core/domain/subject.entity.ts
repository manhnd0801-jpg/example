// AI-GENERATED
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SubjectType { REQUIRED = 'REQUIRED', ELECTIVE = 'ELECTIVE', FREE_ELECTIVE = 'FREE_ELECTIVE' }

@Entity('subjects')
export class SubjectEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column({ name: 'subject_code', length: 20 }) subjectCode: string;
  @Column({ name: 'subject_name', length: 255 }) subjectName: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'theory_credits', default: 2 }) theoryCredits: number;
  @Column({ name: 'practice_credits', default: 1 }) practiceCredits: number;
  @Column({ name: 'total_credits', default: 3 }) totalCredits: number;
  @Column({ name: 'subject_type', type: 'enum', enum: SubjectType, default: SubjectType.REQUIRED }) subjectType: SubjectType;
  @Column({ name: 'tenant_id', length: 100 }) tenantId: string;
  @Column({ type: 'jsonb', default: '{}' }) attributes: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
