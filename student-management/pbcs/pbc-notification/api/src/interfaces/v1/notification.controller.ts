// AI-GENERATED
import { Controller, Get, Patch, Param, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from '../../core/service/notification.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

const meta = (tenantId: string) => ({ timestamp: new Date().toISOString(), requestId: uuidv4(), tenantId });

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('notifications')
  async findNotifications(@Query() query: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const userId = req.user?.sub || req.user?.id;
    const result = await this.notificationService.findNotifications(userId, tenantId, query);
    return {
      data: { notifications: result.items, unreadCount: result.unreadCount, pagination: { page: result.page, pageSize: result.pageSize, total: result.total } },
      metadata: meta(tenantId),
    };
  }

  @Patch('notifications/:id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const userId = req.user?.sub || req.user?.id;
    return { data: await this.notificationService.markAsRead(id, userId, tenantId), metadata: meta(tenantId) };
  }

  @Patch('notifications/read-all')
  async markAllAsRead(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const userId = req.user?.sub || req.user?.id;
    return { data: await this.notificationService.markAllAsRead(userId, tenantId), metadata: meta(tenantId) };
  }

  @Get('audit-logs')
  async findAuditLogs(@Query() query: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    if (req.user?.role !== 'ADMIN') throw new ForbiddenException('Audit logs require ADMIN role');
    const result = await this.notificationService.findAuditLogs(tenantId, query);
    return {
      data: { auditLogs: result.items, pagination: { page: result.page, pageSize: result.pageSize, total: result.total } },
      metadata: meta(tenantId),
    };
  }
}
