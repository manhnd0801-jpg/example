// AI-GENERATED
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './domain/notification.entity';
import { AuditLogEntity } from './domain/audit-log.entity';
import { NotificationService } from './service/notification.service';
import { NotificationController } from '../interfaces/v1/notification.controller';
import { EventConsumer } from '../infrastructure/events/event-consumer';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity, AuditLogEntity])],
  providers: [NotificationService, EventConsumer],
  controllers: [NotificationController],
})
export class NotificationModule {}
