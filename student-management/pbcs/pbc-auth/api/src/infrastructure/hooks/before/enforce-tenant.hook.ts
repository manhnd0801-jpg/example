// AI-GENERATED
// Before hook: enforceTenant — đảm bảo mọi operation đều có tenantId hợp lệ
// Đọc tenantId từ JWT claim (ưu tiên) hoặc header X-Tenant-Id

import { UnauthorizedException } from '@nestjs/common';

export function enforceTenant(
  jwtTenantId: string | undefined,
  headerTenantId: string | undefined,
): string {
  const tenantId = jwtTenantId ?? headerTenantId;

  if (!tenantId || tenantId.trim() === '') {
    throw new UnauthorizedException('Tenant ID không được xác định. Vui lòng đăng nhập lại.');
  }

  return tenantId.trim();
}
