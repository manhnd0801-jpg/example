// AI-GENERATED
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubjectService } from '../../core/service/subject.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

const meta = (tenantId: string) => ({ timestamp: new Date().toISOString(), requestId: uuidv4(), tenantId });

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const result = await this.subjectService.findAll({ ...query, tenantId });
    return { data: { subjects: result.items, pagination: { page: result.page, pageSize: result.pageSize, total: result.total } }, metadata: meta(tenantId) };
  }

  @Post() @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.subjectService.create(body.data, tenantId, body.metadata?.correlationId), metadata: meta(tenantId) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.subjectService.findById(id, tenantId), metadata: meta(tenantId) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.subjectService.update(id, body.data, tenantId, body.metadata?.correlationId), metadata: meta(tenantId) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    await this.subjectService.remove(id, tenantId);
    return { data: { deleted: true }, metadata: meta(tenantId) };
  }

  @Post(':id/assign-to-class')
  async assignToClass(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.subjectService.assignToClass(id, body.data, tenantId, body.metadata?.correlationId), metadata: meta(tenantId) };
  }

  @Post(':id/assign-to-course')
  async assignToCourse(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.subjectService.assignToCourse(id, body.data, tenantId, body.metadata?.correlationId), metadata: meta(tenantId) };
  }
}
