// AI-GENERATED
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { SubjectModule } from './core/subject.module';
import { SubjectEntity } from './core/domain/subject.entity';
import { SubjectClassEntity } from './core/domain/subject-class.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [SubjectEntity, SubjectClassEntity],
      synchronize: true,
    }),
    SubjectModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
