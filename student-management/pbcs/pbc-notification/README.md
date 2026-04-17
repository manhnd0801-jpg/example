# PBC Notification & Audit

PBC thông báo và audit log hoạt động như pure consumer, lắng nghe tất cả sự kiện từ các PBC khác để tạo thông báo cho người dùng và ghi log audit cho admin.

## Tính năng chính

- **Pure Consumer**: Chỉ consume events, không publish events
- **Notification Management**: Tạo và quản lý thông báo cho người dùng
- **Audit Logging**: Ghi log tất cả hoạt động hệ thống
- **Read Status Management**: Quản lý trạng thái đã đọc/chưa đọc thông báo
- **Admin Audit Access**: Cung cấp truy cập audit logs cho admin
- **Multi-tenant Support**: Hỗ trợ đa tenant với schema isolation

## Cấu trúc thư mục

```
pbc-notification/
├── pbc-contract.json          # Contract định nghĩa PBC
├── openapi.yaml              # API specification
├── asyncapi.yaml             # Event specification (chỉ consume)
├── api/                      # Backend NestJS
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── ui/                       # Frontend React
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── db/                       # Database migrations
│   └── migrations/
├── docker/                   # Docker configurations
│   ├── Dockerfile.api
│   └── Dockerfile.ui
└── README.md
```

## API Endpoints

- `GET /v1/notifications` - Danh sách thông báo của người dùng với phân trang và lọc
- `PATCH /v1/notifications/:id/read` - Đánh dấu thông báo đã đọc
- `PATCH /v1/notifications/read-all` - Đánh dấu tất cả thông báo đã đọc
- `GET /v1/audit-logs` - Danh sách audit logs (chỉ admin)

## Events (Pure Consumer)

### Consumed Events từ Student Management
- `pbc.student-management.student.created` - Tạo thông báo + audit log
- `pbc.student-management.student.updated` - Tạo audit log
- `pbc.student-management.student.deleted` - Tạo thông báo + audit log
- `pbc.student-management.student.status-changed` - Tạo thông báo + audit log

### Consumed Events từ Class Management
- `pbc.class-management.class.created` - Tạo thông báo + audit log
- `pbc.class-management.class.updated` - Tạo audit log
- `pbc.class-management.student.assigned-to-class` - Tạo thông báo + audit log
- `pbc.class-management.student.removed-from-class` - Tạo thông báo + audit log

### Consumed Events từ Course Management
- `pbc.course-management.course.created` - Tạo thông báo + audit log
- `pbc.course-management.course.updated` - Tạo audit log
- `pbc.course-management.course.deleted` - Tạo audit log

### Consumed Events từ Subject Management
- `pbc.subject-management.subject.created` - Tạo audit log
- `pbc.subject-management.subject.updated` - Tạo audit log
- `pbc.subject-management.subject.assigned-to-class` - Tạo thông báo + audit log
- `pbc.subject-management.subject.assigned-to-course` - Tạo audit log

## UI Slots

- `notification-bell` - Icon thông báo với badge số lượng chưa đọc (cho Navbar)
- `notification-list` - Danh sách thông báo đầy đủ
- `audit-log` - Giao diện xem audit logs (chỉ admin)

## Business Rules

### Notification Creation
- Tạo thông báo cho các sự kiện quan trọng: tạo sinh viên, thay đổi trạng thái, gán lớp
- Thông báo được gửi đến người dùng liên quan (admin, academic staff)
- Mỗi thông báo có title, content, type và trạng thái đã đọc/chưa đọc

### Audit Logging
- Ghi log tất cả sự kiện từ các PBC khác
- Audit logs chứa: eventType, aggregateId, description, userId, eventData, occurredAt
- Chỉ admin mới có quyền truy cập audit logs
- Audit logs không bao giờ bị xóa (retention policy tùy thuộc vào yêu cầu)

### Notification Types
- `STUDENT_CREATED`: Sinh viên mới được tạo
- `STUDENT_STATUS_CHANGED`: Trạng thái sinh viên thay đổi
- `CLASS_CREATED`: Lớp học mới được tạo
- `STUDENT_ASSIGNED`: Sinh viên được gán vào lớp
- `COURSE_CREATED`: Chương trình đào tạo mới
- `SUBJECT_ASSIGNED`: Môn học được gán vào lớp
- `SYSTEM_ALERT`: Cảnh báo hệ thống

### Read Status Management
- Thông báo mặc định là chưa đọc (`isRead: false`)
- Người dùng có thể đánh dấu từng thông báo hoặc tất cả thông báo đã đọc
- Thời gian đọc (`readAt`) được ghi lại khi đánh dấu đã đọc

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-jwt-secret
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=cg.notification
PORT=3006
CORS_ORIGIN=http://localhost:3000
```

## Development

```bash
# Install dependencies
cd api && npm install
cd ../ui && npm install

# Start development
cd api && npm run start:dev
cd ../ui && npm run dev

# Build for production
cd api && npm run build
cd ../ui && npm run build
```

## Docker

```bash
# Build images
docker build -f docker/Dockerfile.api -t pbc-notification-api .
docker build -f docker/Dockerfile.ui -t pbc-notification-ui .

# Run with docker-compose
docker-compose up -d
```

## Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Event processing tests
npm run test:events
```

## Event Processing Logic

### Event Handler Pattern
```typescript
@EventHandler('pbc.student-management.student.created')
async handleStudentCreated(event: KafkaEvent) {
  // 1. Create audit log
  await this.auditService.createLog(event);
  
  // 2. Create notification for relevant users
  await this.notificationService.createNotification({
    type: 'STUDENT_CREATED',
    title: 'Sinh viên mới được tạo',
    content: `Sinh viên ${event.data.fullName} đã được thêm vào hệ thống`,
    userId: event.data.createdBy
  });
}
```

### Error Handling
- Dead letter queue cho events không xử lý được
- Retry mechanism với exponential backoff
- Logging chi tiết cho debugging
- Health check monitoring cho Kafka consumers