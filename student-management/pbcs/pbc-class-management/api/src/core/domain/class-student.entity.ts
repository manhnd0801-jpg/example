// AI-GENERATED
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('class_students')
export class ClassStudentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'class_id', type: 'uuid' }) classId: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId: string;
  @Column({ name: 'assigned_date', type: 'date', nullable: true }) assignedDate: Date;
  @Column({ name: 'removed_date', type: 'date', nullable: true }) removedDate: Date;
  @Column({ default: 'ACTIVE' }) status: string;
  @Column({ name: 'tenant_id', length: 100 }) tenantId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
