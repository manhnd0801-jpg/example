// AI-GENERATED
import {
  Controller, Get, Post,
  Body, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { RoleService } from '../../core/service/role.service';
import { Roles } from '../../core/guards/roles.guard';
import { buildMetadata } from '../metadata.helper';

@Controller('v1/permissions')
@Roles('ADMIN')   // Chỉ ADMIN được quản lý permissions
export class PermissionController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async list(@Req() req: any) {
    const tenantId = req.user.tenantId;
    const items = await this.roleService.listPermissions(tenantId);
    return {
      data: { items },
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const { code, resource, action, description } = body.data;
    const perm = await this.roleService.createPermission(code, resource, action, description, tenantId);
    return {
      data: perm,
      metadata: buildMetadata(tenantId, body.metadata?.correlationId ?? ''),
    };
  }
}
