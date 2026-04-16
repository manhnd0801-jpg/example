# PBC Student Management

Quản lý hồ sơ sinh viên bao gồm tạo mới, cập nhật, thay đổi trạng thái và nhập/xuất Excel. Đây là nguồn dữ liệu chính (source of truth) cho thông tin sinh viên trong toàn bộ hệ thống.

## Tính năng chính

- **CRUD Operations**: Tạo, đọc, cập nhật, xóa hồ sơ sinh viên
- **Status Management**: Quản lý trạng thái sinh viên (ACTIVE, SUSPENDED, GRADUATED, DROPPED_OUT)
- **Excel Import/Export**: Nhập/xuất dữ liệu sinh viên từ/ra file Excel
- **Event Publishing**: Phát sự kiện khi có thay đổi dữ liệu sinh viên
- **Multi-tenant Support**: Hỗ trợ đa tenant với schema isolation

## Cấu trúc thư mục

```
pbc-student-management/
├── pbc-contract.json          # Contract định nghĩa PBC
├── openapi.yaml              # API specification
├── asyncapi.yaml             # Event specification
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

- `GET /v1/students` - Danh sách sinh viên với phân trang và lọc
- `POST /v1/students` - Tạo sinh viên mới
- `GET /v1/students/:id` - Chi tiết sinh viên
- `PUT /v1/students/:id` - Cập nhật sinh viên
- `DELETE /v1/students/:id` - Xóa sinh viên (soft delete)
- `PATCH /v1/students/:id/status` - Thay đổi trạng thái sinh viên
- `POST /v1/students/import` - Nhập từ Excel
- `GET /v1/students/export` - Xuất ra Excel

## Events

### Published Events
- `pbc.student-management.student.created` - Sinh viên được tạo
- `pbc.student-management.student.updated` - Sinh viên được cập nhật
- `pbc.student-management.student.deleted` - Sinh viên bị xóa
- `pbc.student-management.student.status-changed` - Trạng thái sinh viên thay đổi

### Consumed Events
- `pbc.class-management.student.assigned-to-class` - Sinh viên được gán vào lớp

## UI Slots

- `student-list` - Danh sách sinh viên
- `student-form` - Form tạo/sửa sinh viên
- `student-detail` - Chi tiết sinh viên
- `student-status` - Quản lý trạng thái sinh viên

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-jwt-secret
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=cg.student-mgmt
PORT=3002
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
docker build -f docker/Dockerfile.api -t pbc-student-management-api .
docker build -f docker/Dockerfile.ui -t pbc-student-management-ui .

# Run with docker-compose
docker-compose up -d
```

## Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Property-based tests
npm run test:pbt
```