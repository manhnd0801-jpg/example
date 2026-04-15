// AI-GENERATED
import {
  Controller, Post, Body, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../core/service/auth.service';
import { Public } from '../../core/guards/jwt-auth.guard';
import { buildMetadata } from '../metadata.helper';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any, @Req() req: Request) {
    const { username, password } = body.data;
    const tenantId = body.metadata?.tenantId ?? req.headers['x-tenant-id'] as string ?? 'default';
    const correlationId = body.metadata?.correlationId ?? req.headers['x-correlation-id'] as string ?? '';

    const result = await this.authService.login(username, password, tenantId, correlationId);

    return {
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role?.name,
          status: result.user.status,
        },
      },
      metadata: buildMetadata(tenantId, correlationId),
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: any, @Req() req: any) {
    const { refreshToken, allDevices = false } = body.data;
    const tenantId = req.user.tenantId;
    const correlationId = body.metadata?.correlationId ?? '';

    await this.authService.logout(refreshToken, allDevices, req.user.userId, tenantId, correlationId);

    return {
      data: { message: 'Đăng xuất thành công' },
      metadata: buildMetadata(tenantId, correlationId),
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: any, @Req() req: Request) {
    const { refreshToken } = body.data;
    const tenantId = body.metadata?.tenantId ?? req.headers['x-tenant-id'] as string ?? 'default';

    const result = await this.authService.refresh(refreshToken, tenantId);

    return {
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
      metadata: buildMetadata(tenantId, ''),
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() body: any, @Req() req: any) {
    const { currentPassword, newPassword } = body.data;
    const tenantId = req.user.tenantId;
    const correlationId = body.metadata?.correlationId ?? '';

    await this.authService.changePassword(req.user.userId, currentPassword, newPassword, tenantId);

    return {
      data: { message: 'Mật khẩu đã được thay đổi' },
      metadata: buildMetadata(tenantId, correlationId),
    };
  }
}
