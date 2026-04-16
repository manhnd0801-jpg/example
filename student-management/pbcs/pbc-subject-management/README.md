# PBC Subject Management

Quản lý danh mục môn học bao gồm thông tin tín chỉ, loại môn học và gán môn học vào lớp và chương trình. Là nguồn dữ liệu chính cho thông tin môn học.

## Tính năng chính

- **Subject CRUD**: Tạo, đọc, cập nhật, xóa môn học
- **Credit Management**: Quản lý tín chỉ lý thuyết và thực hành
- **Subject Type Management**: Phân loại môn học (REQUIRED, ELECTIVE, FREE_ELECTIVE)
- **Class Assignment**: Gán môn học vào lớp với thông tin giảng viên và lịch học
- **Course Assignment**: Gán môn học vào chương trình đào tạo theo học kỳ
- **Multi-tenant Support**: Hỗ trợ đa tenant với schema isolation

## Cấu trúc thư mục

```
pbc-subject-management/
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

- `GET /v1/subjects` - Danh sách môn học với phân trang và lọc
- `POST /v1/subjects` - Tạo môn học mới
- `GET /v1/subjects/:id` - Chi tiết môn học
- `PUT /v1/subjects/:id` - Cập nhật môn học
- `DELETE /v1/subjects/:id` - Xóa môn học
- `POST /v1/subjects/:id/assign-to-class` - Gán môn học vào lớp
- `POST /v1/subjects/:id/assign-to-course` - Gán môn học vào chương trình

## Events

### Published Events
- `pbc.subject-management.subject.created` - Môn học được tạo
- `pbc.subject-management.subject.updated` - Môn học được cập nhật
- `pbc.subject-management.subject.assigned-to-class` - Môn học được gán vào lớp
- `pbc.subject-management.subject.assigned-to-course` - Môn học được gán vào chương trình

### Consumed Events
- `pbc.course-management.course.created` - Chuẩn bị catalog môn học cho chương trình mới

## UI Slots

- `subject-list` - Danh sách môn học
- `subject-form` - Form tạo/sửa môn học
- `subject-detail` - Chi tiết môn học
- `subject-assign` - Gán môn học vào lớp/chương trình

## Business Rules

### Credit System
- Mỗi môn học có `theoryCredits` (tín chỉ lý thuyết) và `practiceCredits` (tín chỉ thực hành)
- `totalCredits = theoryCredits + practiceCredits`
- Tín chỉ phải là số nguyên dương, tối đa 15 tín chỉ/môn

### Subject Types
- `REQUIRED`: Môn học bắt buộc trong chương trình
- `ELECTIVE`: Môn học tự chọn trong chương trình
- `FREE_ELECTIVE`: Môn học tự chọn tự do

### Assignment Rules
- Một môn học có thể được gán vào nhiều lớp khác nhau
- Một môn học có thể thuộc nhiều chương trình đào tạo
- Mỗi assignment có thông tin riêng: học kỳ, giảng viên, lịch học

### Subject Code Format
- Format: `[A-Z]{2}[0-9]{3}` (ví dụ: CS101, MA201)
- Unique trong cùng một tenant

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-jwt-secret
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=cg.subject-mgmt
PORT=3005
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
docker build -f docker/Dockerfile.api -t pbc-subject-management-api .
docker build -f docker/Dockerfile.ui -t pbc-subject-management-ui .

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