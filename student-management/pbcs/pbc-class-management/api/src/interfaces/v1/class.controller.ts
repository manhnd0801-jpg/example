// AI-GENERATED
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClassService } from '../../core/service/class.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

const meta = (tenantId: string, correlationId?: string) => ({
  timestamp: new Date().toISOString(), requestId: uuidv4(), correlationId: correlationId || uuidv4(), tenantId,
});

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const result = await this.classService.findAll({ ...query, tenantId });
    return { data: { classes: result.items, pagination: { page: result.page, pageSize: result.pageSize, total: result.total } }, metadata: meta(tenantId) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const cls = await this.classService.create(body.data, tenantId, body.metadata?.correlationId);
    return { data: cls, metadata: meta(tenantId) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.classService.findById(id, tenantId), metadata: meta(tenantId) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.classService.update(id, body.data, tenantId, body.metadata?.correlationId), metadata: meta(tenantId) };
  }

  @Get(':id/students')
  async getStudents(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: { students: await this.classService.getStudents(id, tenantId) }, metadata: meta(tenantId) };
  }

  @Post(':id/students')
  async assignStudent(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    await this.classService.assignStudent(id, body.data?.studentId, tenantId, body.metadata?.correlationId);
    return { data: { assigned: true }, metadata: meta(tenantId) };
  }

  @Delete(':id/students/:studentId')
  async removeStudent(@Param('id') id: string, @Param('studentId') studentId: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    await this.classService.removeStudent(id, studentId, tenantId, '');
    return { data: { removed: true }, metadata: meta(tenantId) };
  }

  @Post(':id/transfer')
  async transfer(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    await this.classService.transferStudent(id, body.data?.studentId, body.data?.targetClassId, tenantId, body.metadata?.correlationId);
    return { data: { transferred: true }, metadata: meta(tenantId) };
  }
}
