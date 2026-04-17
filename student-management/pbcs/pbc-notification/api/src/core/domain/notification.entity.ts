// AI-GENERATED
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @Column({ length: 255 }) title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ length: 50 }) type: string;
  @Column({ name: 'is_read', default: false }) isRead: boolean;
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true }) readAt: Date;
  @Column({ type: 'jsonb', default: '{}' }) metadata: Record<string, unknown>;
  @Column({ name: 'tenant_id', length: 100 }) tenantId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
