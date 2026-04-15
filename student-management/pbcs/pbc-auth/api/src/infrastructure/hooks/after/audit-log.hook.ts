// AI-GENERATED
// After hook: auditLog — ghi lại mọi thao tác quan trọng sau khi thực hiện
// Được gọi sau khi service hoàn thành, không block response

import { Logger } from '@nestjs/common';

const logger = new Logger('AuditLog');

export interface AuditEntry {
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  tenantId: string;
  correlationId: string;
  payload?: Record<string, unknown>;
}

export function auditLog(entry: AuditEntry): void {
  // Log có cấu trúc — tích hợp với log platform
  // Production: ghi vào DB audit_logs hoặc gửi lên log aggregator
  logger.log({
    type: 'AUDIT',
    ...entry,
    occurredAt: new Date().toISOString(),
  });
}
