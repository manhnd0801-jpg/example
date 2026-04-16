// AI-GENERATED
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { ClassModule } from './core/class.module';
import { ClassEntity } from './core/domain/class.entity';
import { ClassStudentEntity } from './core/domain/class-student.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [ClassEntity, ClassStudentEntity],
      synchronize: false,
      migrationsRun: true,
    }),
    ClassModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
