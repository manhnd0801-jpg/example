// AI-GENERATED
// Repository interface — định nghĩa contract, không phụ thuộc ORM cụ thể
import type { UserEntity, UserStatus } from '../domain/user.entity';

export interface ListUsersFilter {
  tenantId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: UserStatus;
}

export interface IUserRepository {
  findById(id: string, tenantId: string): Promise<UserEntity | null>;
  findByUsername(username: string, tenantId: string): Promise<UserEntity | null>;
  findByEmail(email: string, tenantId: string): Promise<UserEntity | null>;
  list(filter: ListUsersFilter): Promise<{ items: UserEntity[]; total: number }>;
  save(user: UserEntity): Promise<UserEntity>;
  softDelete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
