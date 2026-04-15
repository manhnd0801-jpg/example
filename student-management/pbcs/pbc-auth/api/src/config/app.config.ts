// AI-GENERATED
// Config loader — đọc cấu hình từ env vars, đồng bộ với pbc-contract.json
import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiration: process.env.JWT_EXPIRATION ?? '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
}));

export const kafkaConfig = registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  groupId: process.env.KAFKA_GROUP_ID ?? 'cg.auth',
  clientId: process.env.KAFKA_CLIENT_ID ?? 'pbc-auth-api',
}));

export const tenantConfig = registerAs('tenant', () => ({
  // Tenant resolution: jwt-claim (mặc định) hoặc header X-Tenant-Id
  resolution: process.env.TENANT_RESOLUTION ?? 'jwt-claim',
  headerName: process.env.TENANT_HEADER_NAME ?? 'X-Tenant-Id',
}));
