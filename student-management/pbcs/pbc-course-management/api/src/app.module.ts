// AI-GENERATED
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { CourseModule } from './core/course.module';
import { CourseEntity } from './core/domain/course.entity';
import { CourseSubjectEntity } from './core/domain/course-subject.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [CourseEntity, CourseSubjectEntity],
      synchronize: true,
    }),
    CourseModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
