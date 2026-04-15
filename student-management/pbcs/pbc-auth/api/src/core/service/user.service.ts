// AI-GENERATED
import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserStatus } from '../domain/user.entity';
import { EventPublisher } from '../../infrastructure/events/event-publisher';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  roleId: string;
  tenantId: string;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  status?: UserStatus;
}

export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: UserStatus;
  tenantId: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async list(query: ListUsersQuery): Promise<{ items: UserEntity[]; total: number }> {
    const { page = 1, pageSize = 20, search, tenantId } = query;

    const qb = this.userRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .where('u.tenant_id = :tenantId', { tenantId })
      .andWhere('u.deleted_at IS NULL');

    if (search) {
      qb.andWhere(
        '(u.username ILIKE :search OR u.email ILIKE :search OR u.full_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (query.status) qb.andWhere('u.status = :status', { status: query.status });

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: string, tenantId: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id, tenantId, deletedAt: undefined },
    });
    if (!user) throw new NotFoundException(`User ${id} không tồn tại`);
    return user;
  }

  async create(dto: CreateUserDto, correlationId: string): Promise<UserEntity> {
    const existing = await this.userRepo.findOne({
      where: [
        { username: dto.username, tenantId: dto.tenantId },
        { email: dto.email, tenantId: dto.tenantId },
      ],
    });
    if (existing) throw new ConflictException('Username hoặc email đã tồn tại');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      roleId: dto.roleId,
      tenantId: dto.tenantId,
    });
    const saved = await this.userRepo.save(user);

    await this.eventPublisher.publish('pbc.auth.user.created', {
      userId: saved.id,
      username: saved.username,
      email: saved.email,
      role: saved.role?.name,
    }, dto.tenantId, correlationId);

    return saved;
  }

  async update(id: string, dto: UpdateUserDto, tenantId: string): Promise<UserEntity> {
    const user = await this.findById(id, tenantId);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const user = await this.findById(id, tenantId);
    await this.userRepo.softDelete(user.id);
  }

  async changeRole(
    id: string,
    roleId: string,
    tenantId: string,
    correlationId: string,
  ): Promise<UserEntity> {
    const user = await this.findById(id, tenantId);
    const oldRole = user.role?.name;
    user.roleId = roleId;
    const saved = await this.userRepo.save(user);

    await this.eventPublisher.publish('pbc.auth.user.role-changed', {
      userId: id,
      oldRole,
      newRole: saved.role?.name,
    }, tenantId, correlationId);

    return saved;
  }
}
