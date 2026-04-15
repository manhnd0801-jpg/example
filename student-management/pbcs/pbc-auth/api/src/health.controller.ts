// AI-GENERATED
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from './core/guards/jwt-auth.guard';

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('health')
  @Public()
  liveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
