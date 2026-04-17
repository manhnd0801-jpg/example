// AI-GENERATED
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from './domain/class.entity';
import { ClassStudentEntity } from './domain/class-student.entity';
import { ClassService } from './service/class.service';
import { ClassController } from '../interfaces/v1/class.controller';
import { EventPublisher } from '../infrastructure/events/event-publisher';
import { EventConsumer } from '../infrastructure/events/event-consumer';

@Module({
  imports: [TypeOrmModule.forFeature([ClassEntity, ClassStudentEntity])],
  providers: [ClassService, EventPublisher, EventConsumer],
  controllers: [ClassController],
})
export class ClassModule {}
