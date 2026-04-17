# PBC Class Management

Quản lý lớp học bao gồm gán sinh viên, quản lý sức chứa và chuyển lớp. Xử lý logic nghiệp vụ về tổ chức lớp học và phân bổ sinh viên.

## Tính năng chính

- **Class CRUD**: Tạo, đọc, cập nhật, xóa lớp học
- **Student Assignment**: Gán sinh viên vào lớp với kiểm tra sức chứa
- **Capacity Management**: Quản lý số lượng sinh viên tối đa và hiện tại
- **Student Transfer**: Chuyển sinh viên giữa các lớp (atomic operation)
- **Event Integration**: Xử lý sự kiện từ Student Management và Subject Management
- **Multi-tenant Support**: Hỗ trợ đa tenant với schema isolation

## Cấu trúc thư mục

```
pbc-class-management/
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

- `GET /v1/classes` - Danh sách lớp học với phân trang và lọc
- `POST /v1/classes` - Tạo lớp học mới
- `GET /v1/classes/:id` - Chi tiết lớp học
- `PUT /v1/classes/:id` - Cập nhật lớp học
- `DELETE /v1/classes/:id` - Xóa lớp học
- `GET /v1/classes/:id/students` - Danh sách sinh viên trong lớp
- `POST /v1/classes/:id/students` - Gán sinh viên vào lớp
- `DELETE /v1/classes/:id/students/:studentId` - Loại bỏ sinh viên khỏi lớp
- `POST /v1/classes/:id/transfer` - Chuyển sinh viên giữa các lớp

## Events

### Published Events
- `pbc.class-management.class.created` - Lớp học được tạo
- `pbc.class-management.class.updated` - Lớp học được cập nhật
- `pbc.class-management.student.assigned-to-class` - Sinh viên được gán vào lớp
- `pbc.class-management.student.removed-from-class` - Sinh viên bị loại khỏi lớp

### Consumed Events
- `pbc.student-management.student.created` - Chuẩn bị slot cho sinh viên mới
- `pbc.student-management.student.deleted` - Tự động loại sinh viên khỏi tất cả lớp
- `pbc.student-management.student.status-changed` - Xử lý thay đổi trạng thái sinh viên
- `pbc.subject-management.subject.assigned-to-class` - Cập nhật danh sách môn học của lớp

## UI Slots

- `class-list` - Danh sách lớp học
- `class-form` - Form tạo/sửa lớp học
- `class-detail` - Chi tiết lớp học
- `class-assign` - Gán sinh viên vào lớp

## Business Rules

### Capacity Management
- Mỗi lớp có `maxStudents` (tối đa) và `currentStudents` (hiện tại)
- Không thể gán sinh viên khi `currentStudents >= maxStudents`
- `currentStudents` được cập nhật tự động khi gán/loại bỏ sinh viên

### Student Assignment
- Một sinh viên chỉ có thể thuộc về một lớp tại một thời điểm
- Gán sinh viên sẽ kiểm tra sức chứa trước khi thực hiện
- Phát sự kiện `student.assigned-to-class` để thông báo cho các PBC khác

### Student Transfer
- Chuyển lớp là atomic operation (hoặc thành công hoàn toàn hoặc thất bại)
- Kiểm tra sức chứa lớp đích trước khi chuyển
- Cập nhật cả lớp nguồn và lớp đích

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-jwt-secret
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=cg.class-mgmt
PORT=3003
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
docker build -f docker/Dockerfile.api -t pbc-class-management-api .
docker build -f docker/Dockerfile.ui -t pbc-class-management-ui .

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