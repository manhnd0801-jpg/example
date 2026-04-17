// AI-GENERATED
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CourseService } from '../../core/service/course.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

const meta = (tenantId: string) => ({ timestamp: new Date().toISOString(), requestId: uuidv4(), tenantId });

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const result = await this.courseService.findAll({ ...query, tenantId });
    return { data: { courses: result.items, pagination: { page: result.page, pageSize: result.pageSize, total: result.total } }, metadata: meta(tenantId) };
  }

  @Post() @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.courseService.create(body.data, tenantId, body.metadata?.correlationId), metadata: meta(tenantId) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.courseService.findById(id, tenantId), metadata: meta(tenantId) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.courseService.update(id, body.data, tenantId, body.metadata?.correlationId), metadata: meta(tenantId) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    await this.courseService.remove(id, tenantId, '');
    return { data: { deleted: true }, metadata: meta(tenantId) };
  }

  @Get(':id/subjects')
  async getSubjects(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: { subjects: await this.courseService.getSubjects(id, tenantId) }, metadata: meta(tenantId) };
  }

  @Post(':id/subjects')
  async addSubject(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    return { data: await this.courseService.addSubject(id, body.data, tenantId), metadata: meta(tenantId) };
  }

  @Delete(':id/subjects/:subjectId')
  async removeSubject(@Param('id') id: string, @Param('subjectId') subjectId: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    await this.courseService.removeSubject(id, subjectId, tenantId);
    return { data: { removed: true }, metadata: meta(tenantId) };
  }
}
