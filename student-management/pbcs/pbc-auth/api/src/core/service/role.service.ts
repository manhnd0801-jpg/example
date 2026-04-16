// AI-GENERATED
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../domain/role.entity';
import { PermissionEntity } from '../domain/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permRepo: Repository<PermissionEntity>,
  ) {}

  async listRoles(tenantId: string): Promise<RoleEntity[]> {
    return this.roleRepo.find({ where: { tenantId } });
  }

  async findRoleById(id: string, tenantId: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findOne({ where: { id, tenantId } });
    if (!role) throw new NotFoundException(`Role ${id} không tồn tại`);
    return role;
  }

  async createRole(name: string, description: string | undefined, tenantId: string): Promise<RoleEntity> {
    const role = this.roleRepo.create({ name, description, tenantId });
    return this.roleRepo.save(role);
  }

  async updateRole(id: string, name: string, description: string | undefined, tenantId: string): Promise<RoleEntity> {
    const role = await this.findRoleById(id, tenantId);
    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    return this.roleRepo.save(role);
  }

  async deleteRole(id: string, tenantId: string): Promise<void> {
    const role = await this.findRoleById(id, tenantId);
    await this.roleRepo.remove(role);
  }

  async getRolePermissions(roleId: string, tenantId: string): Promise<PermissionEntity[]> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId, tenantId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role ${roleId} không tồn tại`);
    return role.permissions;
  }

  async assignPermissions(roleId: string, permissionIds: string[], tenantId: string): Promise<void> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId, tenantId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role ${roleId} không tồn tại`);

    const permissions = await this.permRepo.findByIds(permissionIds);
    role.permissions = permissions;
    await this.roleRepo.save(role);
  }

  async listPermissions(tenantId: string): Promise<PermissionEntity[]> {
    return this.permRepo.find({ where: { tenantId } });
  }

  async createPermission(
    code: string, resource: string, action: string,
    description: string | undefined, tenantId: string,
  ): Promise<PermissionEntity> {
    const perm = this.permRepo.create({ code, resource, action, description, tenantId });
    return this.permRepo.save(perm);
  }
}
