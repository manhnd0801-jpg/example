// AI-GENERATED
import { v4 as uuidv4 } from 'uuid';

export function buildMetadata(tenantId: string, correlationId?: string) {
  return {
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
    correlationId: correlationId || uuidv4(),
    tenantId,
  };
}
