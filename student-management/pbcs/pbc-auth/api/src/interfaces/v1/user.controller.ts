// AI-GENERATED
import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UserService } from '../../core/service/user.service';
import { buildMetadata } from '../metadata.helper';

@Controller('v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async list(@Query() query: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const result = await this.userService.list({ ...query, tenantId });
    return {
      data: {
        items: result.items.map(this.mapUser),
        total: result.total,
        page: Number(query.page ?? 1),
        pageSize: Number(query.pageSize ?? 20),
      },
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Get(':userId')
  async getById(@Param('userId') userId: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const user = await this.userService.findById(userId, tenantId);
    return {
      data: this.mapUser(user),
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const correlationId = body.metadata?.correlationId ?? '';
    const user = await this.userService.create({ ...body.data, tenantId }, correlationId);
    return {
      data: this.mapUser(user),
      metadata: buildMetadata(tenantId, correlationId),
    };
  }

  @Put(':userId')
  async update(@Param('userId') userId: string, @Body() body: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const user = await this.userService.update(userId, body.data, tenantId);
    return {
      data: this.mapUser(user),
      metadata: buildMetadata(tenantId, body.metadata?.correlationId ?? ''),
    };
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('userId') userId: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    await this.userService.delete(userId, tenantId);
    return {
      data: { message: 'Người dùng đã bị xóa' },
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Patch(':userId/role')
  async changeRole(@Param('userId') userId: string, @Body() body: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    const correlationId = body.metadata?.correlationId ?? '';
    const user = await this.userService.changeRole(userId, body.data.roleId, tenantId, correlationId);
    return {
      data: this.mapUser(user),
      metadata: buildMetadata(tenantId, correlationId),
    };
  }

  private mapUser(user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role?.name,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
