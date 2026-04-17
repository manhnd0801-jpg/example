// AI-GENERATED
import { Logger } from '@nestjs/common';

const logger = new Logger('AuditLog');

export interface AuditEntry {
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  tenantId: string;
  correlationId: string;
}

export function auditLog(entry: AuditEntry): void {
  logger.log(JSON.stringify({ type: 'AUDIT', ...entry, timestamp: new Date().toISOString() }));
}
