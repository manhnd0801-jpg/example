// AI-GENERATED
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'full_name', length: 255, nullable: true })
  fullName: string | null;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => RoleEntity, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, unknown> | null;

  @Column({ name: 'tenant_id', length: 100 })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
