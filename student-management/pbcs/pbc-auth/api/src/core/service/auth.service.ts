// AI-GENERATED
import {
  Injectable, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../domain/user.entity';
import { RefreshTokenEntity } from '../domain/refresh-token.entity';
import { EventPublisher } from '../../infrastructure/events/event-publisher';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserEntity;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly tokenRepo: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async login(
    username: string,
    password: string,
    tenantId: string,
    correlationId: string,
  ): Promise<LoginResult> {
    const user = await this.userRepo.findOne({
      where: { username, tenantId },
      relations: ['role'],
    });

    if (!user) throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc vô hiệu hóa');
    }

    const { accessToken, expiresIn } = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id, tenantId);

    await this.eventPublisher.publish('pbc.auth.user.logged-in', {
      userId: user.id,
      username: user.username,
      role: user.role.name,
    }, tenantId, correlationId);

    return { accessToken, refreshToken: refreshToken.token, expiresIn, user };
  }

  async logout(
    refreshToken: string,
    allDevices: boolean,
    userId: string,
    tenantId: string,
    correlationId: string,
  ): Promise<void> {
    if (allDevices) {
      await this.tokenRepo.update(
        { userId, tenantId },
        { revokedAt: new Date() },
      );
    } else {
      const token = await this.tokenRepo.findOne({ where: { token: refreshToken, tenantId } });
      if (token) {
        token.revokedAt = new Date();
        await this.tokenRepo.save(token);
      }
    }

    await this.eventPublisher.publish('pbc.auth.user.logged-out', {
      userId,
    }, tenantId, correlationId);
  }

  async refresh(refreshToken: string, tenantId: string): Promise<LoginResult> {
    const tokenEntity = await this.tokenRepo.findOne({
      where: { token: refreshToken, tenantId },
      relations: ['user'],
    });

    if (!tokenEntity || !tokenEntity.isValid) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Revoke old token (rotation)
    tokenEntity.revokedAt = new Date();
    await this.tokenRepo.save(tokenEntity);

    const user = tokenEntity.user;
    const { accessToken, expiresIn } = this.generateAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user.id, tenantId);

    return { accessToken, refreshToken: newRefreshToken.token, expiresIn, user };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    tenantId: string,
  ): Promise<void> {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId, tenantId } });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.save(user);

    // Revoke all refresh tokens after password change
    await this.tokenRepo.update({ userId, tenantId }, { revokedAt: new Date() });
  }

  private generateAccessToken(user: UserEntity): { accessToken: string; expiresIn: number } {
    const expiresIn = 15 * 60; // 15 minutes in seconds
    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role.name,
      tenantId: user.tenantId,
    });
    return { accessToken, expiresIn };
  }

  private async createRefreshToken(userId: string, tenantId: string): Promise<RefreshTokenEntity> {
    const token = this.tokenRepo.create({
      userId,
      tenantId,
      token: uuidv4(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    return this.tokenRepo.save(token);
  }
}
