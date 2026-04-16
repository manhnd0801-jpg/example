// AI-GENERATED
import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    try { req.user = jwt.verify(auth.split(' ')[1], this.config.getOrThrow<string>('JWT_SECRET')); return true; }
    catch { throw new UnauthorizedException('Invalid token'); }
  }
}
