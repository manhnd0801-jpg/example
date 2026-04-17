// AI-GENERATED
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './domain/course.entity';
import { CourseSubjectEntity } from './domain/course-subject.entity';
import { CourseService } from './service/course.service';
import { CourseController } from '../interfaces/v1/course.controller';
import { EventPublisher } from '../infrastructure/events/event-publisher';
import { EventConsumer } from '../infrastructure/events/event-consumer';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, CourseSubjectEntity])],
  providers: [CourseService, EventPublisher, EventConsumer],
  controllers: [CourseController],
})
export class CourseModule {}
