// AI-GENERATED
// After hook: invalidateCache — xóa cache liên quan sau khi dữ liệu thay đổi
// Placeholder — tích hợp Redis hoặc in-memory cache khi cần

import { Logger } from '@nestjs/common';

const logger = new Logger('InvalidateCache');

export function invalidateCache(keys: string[]): void {
  // TODO: tích hợp Redis client khi platform yêu cầu cache
  // Hiện tại chỉ log để trace
  if (keys.length > 0) {
    logger.debug(`Cache invalidated for keys: ${keys.join(', ')}`);
  }
}
