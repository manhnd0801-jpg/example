# PBC Course Management

Quản lý chương trình đào tạo (khóa học) bao gồm quản lý curriculum, kế hoạch học kỳ và gán môn học vào chương trình. Định nghĩa cấu trúc học tập cho các lớp.

## Tính năng chính

- **Course CRUD**: Tạo, đọc, cập nhật, xóa chương trình đào tạo
- **Curriculum Management**: Quản lý curriculum và cấu trúc môn học
- **Subject Assignment**: Gán môn học vào chương trình theo học kỳ
- **Credit Management**: Tính toán và quản lý tín chỉ tổng cộng
- **Status Management**: Quản lý trạng thái chương trình (ACTIVE, CLOSED, UPCOMING)
- **Multi-tenant Support**: Hỗ trợ đa tenant với schema isolation

## Cấu trúc thư mục

```
pbc-course-management/
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

- `GET /v1/courses` - Danh sách chương trình đào tạo với phân trang và lọc
- `POST /v1/courses` - Tạo chương trình đào tạo mới
- `GET /v1/courses/:id` - Chi tiết chương trình đào tạo
- `PUT /v1/courses/:id` - Cập nhật chương trình đào tạo
- `DELETE /v1/courses/:id` - Xóa chương trình đào tạo
- `GET /v1/courses/:id/subjects` - Danh sách môn học trong chương trình
- `POST /v1/courses/:id/subjects` - Thêm môn học vào chương trình
- `PUT /v1/courses/:id/subjects/:subjectId` - Cập nhật thông tin môn học trong chương trình
- `DELETE /v1/courses/:id/subjects/:subjectId` - Loại bỏ môn học khỏi chương trình

## Events

### Published Events
- `pbc.course-management.course.created` - Chương trình đào tạo được tạo
- `pbc.course-management.course.updated` - Chương trình đào tạo được cập nhật
- `pbc.course-management.course.deleted` - Chương trình đào tạo bị xóa

### Consumed Events
- `pbc.subject-management.subject.assigned-to-course` - Môn học được gán vào chương trình

## UI Slots

- `course-list` - Danh sách chương trình đào tạo
- `course-form` - Form tạo/sửa chương trình đào tạo
- `course-detail` - Chi tiết chương trình đào tạo với curriculum

## Business Rules

### Course Structure
- Mỗi chương trình có `durationYears` (thời gian đào tạo) và `totalCredits` (tổng tín chỉ)
- Chương trình được chia thành các học kỳ (semester)
- Mỗi môn học trong chương trình có thông tin: học kỳ, bắt buộc/tự chọn, thứ tự

### Subject Assignment
- Môn học có thể được gán vào nhiều chương trình khác nhau
- Mỗi assignment có thông tin: `semester`, `isRequired`, `orderIndex`
- Tổng tín chỉ được tính tự động từ các môn học đã gán

### Status Management
- `ACTIVE`: Chương trình đang hoạt động, có thể tuyển sinh
- `CLOSED`: Chương trình đã đóng, không tuyển sinh mới
- `UPCOMING`: Chương trình sắp mở, chưa tuyển sinh

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-jwt-secret
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=cg.course-mgmt
PORT=3004
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
docker build -f docker/Dockerfile.api -t pbc-course-management-api .
docker build -f docker/Dockerfile.ui -t pbc-course-management-ui .

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