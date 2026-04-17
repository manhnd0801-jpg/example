// AI-GENERATED
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './domain/student.entity';
import { StudentService } from './service/student.service';
import { StudentRepository } from './repository/student.repository';
import { StudentController } from '../interfaces/v1/student.controller';
import { EventConsumer } from '../infrastructure/events/event-consumer';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity])],
  providers: [StudentService, StudentRepository, EventConsumer],
  controllers: [StudentController],
  exports: [StudentService],
})
export class StudentModule {}
