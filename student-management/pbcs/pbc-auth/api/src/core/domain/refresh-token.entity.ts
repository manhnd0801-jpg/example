// AI-GENERATED
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ length: 500, unique: true })
  token: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'tenant_id', length: 100 })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  get isValid(): boolean {
    return !this.isExpired && !this.isRevoked;
  }
}
