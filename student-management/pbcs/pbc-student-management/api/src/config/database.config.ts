// AI-GENERATED
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { StudentEntity } from '../core/domain/student.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get<string>('DATABASE_URL'),
      schema: this.configService.get<string>('DB_SCHEMA', 'tenant_default'),
      entities: [StudentEntity],
      migrations: ['dist/db/migrations/*.js'],
      migrationsRun: true,
      synchronize: false,
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: this.configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
}