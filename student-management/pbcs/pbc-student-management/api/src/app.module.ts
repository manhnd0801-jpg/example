// AI-GENERATED
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { StudentModule } from './core/student.module';
import { KafkaModule } from './infrastructure/kafka/kafka.module';
import { DatabaseConfig } from './config/database.config';
import { KafkaConfig } from './config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    KafkaModule.forRootAsync({
      useClass: KafkaConfig,
    }),
    StudentModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}