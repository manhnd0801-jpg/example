// AI-GENERATED
import { BadRequestException } from '@nestjs/common';

export function enforceTenant(jwtTenantId?: string, headerTenantId?: string): string {
  const tenantId = jwtTenantId ?? headerTenantId;
  if (!tenantId) {
    throw new BadRequestException('Tenant ID is required');
  }
  return tenantId;
}
