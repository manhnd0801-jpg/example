// AI-GENERATED
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  code: string;

  @Column({ length: 100 })
  resource: string;

  @Column({ length: 100 })
  action: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'tenant_id', length: 100 })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
