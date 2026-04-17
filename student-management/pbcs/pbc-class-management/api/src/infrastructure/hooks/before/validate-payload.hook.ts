// AI-GENERATED
import { BadRequestException } from '@nestjs/common';

export function validatePayload(payload: Record<string, unknown>, requiredFields: string[]): void {
  const missing = requiredFields.filter((f) => payload[f] === undefined || payload[f] === null || payload[f] === '');
  if (missing.length > 0) {
    throw new BadRequestException(`Missing required fields: ${missing.join(', ')}`);
  }
}
