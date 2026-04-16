// AI-GENERATED
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
        database: { type: 'string', example: 'connected' },
        service: { type: 'string', example: 'pbc-student-management' },
      },
    },
  })
  async getHealth() {
    const timestamp = new Date().toISOString();
    
    // Check database connection
    let databaseStatus = 'disconnected';
    try {
      await this.dataSource.query('SELECT 1');
      databaseStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    return {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp,
      database: databaseStatus,
      service: 'pbc-student-management',
      version: '1.0.0',
    };
  }
}