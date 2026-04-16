// AI-GENERATED
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'event_type', length: 255 }) eventType: string;
  @Column({ name: 'aggregate_id', length: 255, nullable: true }) aggregateId: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'user_id', type: 'uuid', nullable: true }) userId: string;
  @Column({ name: 'event_data', type: 'jsonb', default: '{}' }) eventData: Record<string, unknown>;
  @Column({ name: 'occurred_at', type: 'timestamptz' }) occurredAt: Date;
  @Column({ name: 'tenant_id', length: 100 }) tenantId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
