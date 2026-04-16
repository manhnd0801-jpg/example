// AI-GENERATED
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { NotificationModule } from './core/notification.module';
import { NotificationEntity } from './core/domain/notification.entity';
import { AuditLogEntity } from './core/domain/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [NotificationEntity, AuditLogEntity],
      synchronize: false,
    }),
    NotificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
