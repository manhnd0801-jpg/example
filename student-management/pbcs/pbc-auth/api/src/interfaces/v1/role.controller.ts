// AI-GENERATED
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { RoleService } from '../../core/service/role.service';
import { Roles } from '../../core/guards/roles.guard';
import { buildMetadata } from '../metadata.helper';

@Controller('v1/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Roles('ADMIN', 'ACADEMIC_STAFF')   // Đọc danh sách role — cần để tạo user
  async list(@Req() req: any) {
    const tenantId = req.user.tenantId;
    const items = await this.roleService.listRoles(tenantId);
    return {
      data: { items: items.map(this.mapRole) },
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Get(':roleId')
  @Roles('ADMIN', 'ACADEMIC_STAFF')   // Đọc chi tiết role
  async getById(@Param('roleId') roleId: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const role = await this.roleService.findRoleById(roleId, tenantId);
    return {
      data: this.mapRole(role),
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Post()
  @Roles('ADMIN')   // Chỉ ADMIN tạo role mới
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const { name, description } = body.data;
    const role = await this.roleService.createRole(name, description, tenantId);
    return {
      data: this.mapRole(role),
      metadata: buildMetadata(tenantId, body.metadata?.correlationId ?? ''),
    };
  }

  @Put(':roleId')
  @Roles('ADMIN')   // Chỉ ADMIN sửa role
  async update(@Param('roleId') roleId: string, @Body() body: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const { name, description } = body.data;
    const role = await this.roleService.updateRole(roleId, name, description, tenantId);
    return {
      data: this.mapRole(role),
      metadata: buildMetadata(tenantId, body.metadata?.correlationId ?? ''),
    };
  }

  @Delete(':roleId')
  @Roles('ADMIN')   // Chỉ ADMIN xóa role
  @HttpCode(HttpStatus.OK)
  async delete(@Param('roleId') roleId: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    await this.roleService.deleteRole(roleId, tenantId);
    return {
      data: { message: 'Role đã bị xóa' },
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Get(':roleId/permissions')
  async getPermissions(@Param('roleId') roleId: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const items = await this.roleService.getRolePermissions(roleId, tenantId);
    return {
      data: { items },
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Post(':roleId/permissions')
  @HttpCode(HttpStatus.OK)
  async assignPermissions(@Param('roleId') roleId: string, @Body() body: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    await this.roleService.assignPermissions(roleId, body.data.permissionIds, tenantId);
    return {
      data: { message: 'Permissions đã được gán' },
      metadata: buildMetadata(tenantId, body.metadata?.correlationId ?? ''),
    };
  }

  private mapRole(role: any) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
    };
  }
}
