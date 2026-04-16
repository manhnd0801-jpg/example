// AI-GENERATED
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectEntity } from './domain/subject.entity';
import { SubjectClassEntity } from './domain/subject-class.entity';
import { SubjectService } from './service/subject.service';
import { SubjectController } from '../interfaces/v1/subject.controller';
import { EventPublisher } from '../infrastructure/events/event-publisher';
import { EventConsumer } from '../infrastructure/events/event-consumer';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectEntity, SubjectClassEntity])],
  providers: [SubjectService, EventPublisher, EventConsumer],
  controllers: [SubjectController],
})
export class SubjectModule {}
