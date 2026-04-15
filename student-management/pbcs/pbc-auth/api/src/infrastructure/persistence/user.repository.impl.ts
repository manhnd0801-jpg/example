// AI-GENERATED
// TypeORM implementation của IUserRepository
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserStatus } from '../../core/domain/user.entity';
import type { IUserRepository, ListUsersFilter } from '../../core/repository/user.repository';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findById(id: string, tenantId: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId, deletedAt: undefined },
    });
  }

  async findByUsername(username: string, tenantId: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { username, tenantId, deletedAt: undefined } });
  }

  async findByEmail(email: string, tenantId: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email, tenantId, deletedAt: undefined } });
  }

  async list(filter: ListUsersFilter): Promise<{ items: UserEntity[]; total: number }> {
    const { tenantId, page = 1, pageSize = 20, search, status } = filter;

    const qb = this.repo.createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .where('u.tenant_id = :tenantId', { tenantId })
      .andWhere('u.deleted_at IS NULL');

    if (search) {
      qb.andWhere(
        '(u.username ILIKE :s OR u.email ILIKE :s OR u.full_name ILIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (status) qb.andWhere('u.status = :status', { status });

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return this.repo.save(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
