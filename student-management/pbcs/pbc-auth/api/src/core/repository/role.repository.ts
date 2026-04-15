// AI-GENERATED
import type { RoleEntity } from '../domain/role.entity';

export interface IRoleRepository {
  findById(id: string, tenantId: string): Promise<RoleEntity | null>;
  findAll(tenantId: string): Promise<RoleEntity[]>;
  save(role: RoleEntity): Promise<RoleEntity>;
  delete(id: string): Promise<void>;
}

export const ROLE_REPOSITORY = Symbol('IRoleRepository');
