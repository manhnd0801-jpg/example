// AI-GENERATED
import {
  Controller, Get, Post, Put, Delete, Patch, Body, Param, Query,
  UseGuards, Request, UploadedFile, UseInterceptors, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { StudentService } from '../../core/service/student.service';
import { StudentStatus } from '../../core/domain/student.entity';
import { buildMetadata } from '../metadata.helper';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: 'List students' })
  async findAll(@Query() query: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const result = await this.studentService.findAll({ ...query, tenantId });
    return {
      data: { students: result.items, pagination: { page: result.page, pageSize: result.pageSize, total: result.total } },
      metadata: buildMetadata(tenantId),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create student' })
  async create(@Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const correlationId = body.metadata?.correlationId;
    const student = await this.studentService.create(body.data, tenantId, correlationId);
    return { data: student, metadata: buildMetadata(tenantId, correlationId) };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export students to Excel' })
  async exportExcel(@Query() query: any, @Request() req: any, @Res() res: Response) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const result = await this.studentService.findAll({ ...query, tenantId, pageSize: 10000 });
    // Simple CSV export (xlsx library would be used in full implementation)
    const csv = ['studentCode,fullName,status,email,phone', ...result.items.map(s =>
      `${s.studentCode},${s.fullName},${s.status},${s.email || ''},${s.phone || ''}`
    )].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import students from Excel' })
  async importExcel(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    // Placeholder — full xlsx parsing would be implemented here
    return {
      data: { imported: 0, failed: 0, message: 'Import endpoint ready' },
      metadata: buildMetadata(tenantId),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const student = await this.studentService.findById(id, tenantId);
    return { data: student, metadata: buildMetadata(tenantId) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student' })
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const correlationId = body.metadata?.correlationId;
    const student = await this.studentService.update(id, body.data, tenantId, correlationId);
    return { data: student, metadata: buildMetadata(tenantId, correlationId) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    await this.studentService.remove(id, tenantId, '');
    return { data: { deleted: true }, metadata: buildMetadata(tenantId) };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change student status' })
  async changeStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || 'tenant-default';
    const correlationId = body.metadata?.correlationId;
    const student = await this.studentService.changeStatus(id, body.data?.newStatus as StudentStatus, tenantId, correlationId);
    return { data: student, metadata: buildMetadata(tenantId, correlationId) };
  }
}
