// AI-GENERATED
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from './core/auth.module';
import { HealthController } from './health.controller';
import { UserEntity } from './core/domain/user.entity';
import { RoleEntity } from './core/domain/role.entity';
import { PermissionEntity } from './core/domain/permission.entity';
import { RefreshTokenEntity } from './core/domain/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities: [UserEntity, RoleEntity, PermissionEntity, RefreshTokenEntity],
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    TerminusModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
