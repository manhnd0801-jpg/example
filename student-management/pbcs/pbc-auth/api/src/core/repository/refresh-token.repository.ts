// AI-GENERATED
import type { RefreshTokenEntity } from '../domain/refresh-token.entity';

export interface IRefreshTokenRepository {
  findByToken(token: string, tenantId: string): Promise<RefreshTokenEntity | null>;
  save(token: RefreshTokenEntity): Promise<RefreshTokenEntity>;
  revokeByUserId(userId: string, tenantId: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('IRefreshTokenRepository');
