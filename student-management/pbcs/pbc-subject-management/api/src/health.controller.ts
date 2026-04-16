// AI-GENERATED
import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}
  @Get()
  async getHealth() {
    let db = 'disconnected';
    try { await this.ds.query('SELECT 1'); db = 'connected'; } catch {}
    return { status: db === 'connected' ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString(), database: db, service: 'pbc-subject-management' };
  }
}
