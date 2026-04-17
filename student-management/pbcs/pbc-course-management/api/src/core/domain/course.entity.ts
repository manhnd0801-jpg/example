// AI-GENERATED
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CourseStatus { ACTIVE = 'ACTIVE', CLOSED = 'CLOSED', UPCOMING = 'UPCOMING' }

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column({ name: 'course_code', length: 20 }) courseCode: string;
  @Column({ name: 'course_name', length: 255 }) courseName: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'duration_years', default: 4 }) durationYears: number;
  @Column({ name: 'total_credits', default: 0 }) totalCredits: number;
  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.UPCOMING }) status: CourseStatus;
  @Column({ name: 'tenant_id', length: 100 }) tenantId: string;
  @Column({ type: 'jsonb', default: '{}' }) attributes: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
