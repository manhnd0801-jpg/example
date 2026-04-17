// AI-GENERATED
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import pino from 'pino';

async function bootstrap() {
  const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3011,http://localhost:3000').split(','),
    credentials: true,
  });

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);
  logger.info(`[pbc-auth] API running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('[pbc-auth] Bootstrap failed:', err);
  process.exit(1);
});
