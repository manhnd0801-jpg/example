// AI-GENERATED
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { UserEntity } from './domain/user.entity';
import { RoleEntity } from './domain/role.entity';
import { PermissionEntity } from './domain/permission.entity';
import { RefreshTokenEntity } from './domain/refresh-token.entity';

import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service';

import { JwtStrategy } from './guards/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { EventPublisher } from '../infrastructure/events/event-publisher';

import { AuthController } from '../interfaces/v1/auth.controller';
import { UserController } from '../interfaces/v1/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity, RefreshTokenEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION', '15m') },
      }),
    }),
  ],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    EventPublisher,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController, UserController],
})
export class AuthModule {}
