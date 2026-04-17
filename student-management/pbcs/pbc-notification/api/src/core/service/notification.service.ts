// AI-GENERATED
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../domain/notification.entity';
import { AuditLogEntity } from '../domain/audit-log.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity) private readonly notifRepo: Repository<NotificationEntity>,
    @InjectRepository(AuditLogEntity) private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async findNotifications(userId: string, tenantId: string, filter: any) {
    const { page = 1, pageSize = 20, isRead } = filter;
    const where: any = { userId, tenantId };
    if (isRead !== undefined) where.isRead = isRead === 'true';
    const [items, total] = await this.notifRepo.findAndCount({ where, order: { createdAt: 'DESC' }, skip: (page - 1) * pageSize, take: pageSize });
    const unreadCount = await this.notifRepo.count({ where: { userId, tenantId, isRead: false } });
    return { items, total, page, pageSize, unreadCount };
  }

  async markAsRead(id: string, userId: string, tenantId: string) {
    await this.notifRepo.update({ id, userId, tenantId }, { isRead: true, readAt: new Date() });
    return this.notifRepo.findOne({ where: { id } });
  }

  async markAllAsRead(userId: string, tenantId: string) {
    const result = await this.notifRepo.update({ userId, tenantId, isRead: false }, { isRead: true, readAt: new Date() });
    return { markedCount: result.affected || 0, readAt: new Date().toISOString() };
  }

  async findAuditLogs(tenantId: string, filter: any) {
    const { page = 1, pageSize = 20, eventType } = filter;
    const where: any = { tenantId };
    if (eventType) where.eventType = eventType;
    const [items, total] = await this.auditRepo.findAndCount({ where, order: { occurredAt: 'DESC' }, skip: (page - 1) * pageSize, take: pageSize });
    return { items, total, page, pageSize };
  }

  async createNotification(data: Partial<NotificationEntity>) {
    return this.notifRepo.save(data);
  }

  async createAuditLog(data: Partial<AuditLogEntity>) {
    return this.auditRepo.save(data);
  }

  async processEvent(topic: string, envelope: any) {
    const { data, tenantId, occurredAt, correlationId } = envelope;

    // Always create audit log
    await this.createAuditLog({
      eventType: topic,
      aggregateId: data.studentId || data.classId || data.courseId || data.subjectId,
      description: `Event: ${topic}`,
      eventData: data,
      occurredAt: new Date(occurredAt),
      tenantId,
    });

    // Create notification for key events
    const notifMap: Record<string, { title: string; content: string; type: string }> = {
      'pbc.auth.user.logged-in': { title: 'Đăng nhập', content: `User ${data.userId} đã đăng nhập`, type: 'AUTH_LOGGED_IN' },
      'pbc.auth.user.logged-out': { title: 'Đăng xuất', content: `User ${data.userId} đã đăng xuất`, type: 'AUTH_LOGGED_OUT' },
      'pbc.auth.user.created': { title: 'Tạo tài khoản', content: `Tài khoản ${data.username || data.email} đã được tạo`, type: 'AUTH_USER_CREATED' },
      'pbc.auth.user.role-changed': { title: 'Đổi quyền', content: `User ${data.userId} đổi quyền từ ${data.oldRole} sang ${data.newRole}`, type: 'AUTH_ROLE_CHANGED' },
      'pbc.student-management.student.created': { title: 'Sinh viên mới', content: `Sinh viên ${data.fullName || data.studentCode} đã được tạo`, type: 'STUDENT_CREATED' },
      'pbc.student-management.student.status-changed': { title: 'Thay đổi trạng thái', content: `Sinh viên ${data.studentId} chuyển từ ${data.oldStatus} sang ${data.newStatus}`, type: 'STUDENT_STATUS_CHANGED' },
      'pbc.class-management.class.created': { title: 'Lớp học mới', content: `Lớp ${data.className || data.classCode} đã được tạo`, type: 'CLASS_CREATED' },
      'pbc.class-management.student.assigned-to-class': { title: 'Gán lớp học', content: `Sinh viên đã được gán vào lớp ${data.className}`, type: 'STUDENT_ASSIGNED' },
      'pbc.course-management.course.created': { title: 'Chương trình mới', content: `Chương trình ${data.courseName} đã được tạo`, type: 'COURSE_CREATED' },
      'pbc.subject-management.subject.assigned-to-class': { title: 'Môn học mới', content: `Môn học đã được gán vào lớp`, type: 'SUBJECT_ASSIGNED' },
    };

    const notifData = notifMap[topic];
    if (notifData) {
      await this.createNotification({
        userId: data.userId || '00000000-0000-0000-0000-000000000000',
        ...notifData,
        tenantId,
        metadata: { correlationId, eventType: topic },
      });
    }
  }
}
