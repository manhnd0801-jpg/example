# Student Management Portal

Composed App quản lý sinh viên được xây dựng trên VNPT Composable Platform.

## Tổng quan

**Student Management Portal** là hệ thống quản lý sinh viên được xây dựng theo kiến trúc **Micro Frontend + Microservice**, sử dụng mô hình **Packaged Business Capability (PBC)**. Mỗi PBC là một đơn vị độc lập gồm UI (React + Vite) và Backend Service, giao tiếp với nhau qua **Kafka Event Bus**.

## Kiến trúc

```
student-management-portal/
├── app-shell/                    # React host shell (Module Federation)
├── pbcs/
│   ├── pbc-auth/                 # Authentication & Authorization
│   ├── pbc-student-management/   # Quản lý Sinh viên
│   ├── pbc-class-management/     # Quản lý Lớp học
│   ├── pbc-course-management/    # Quản lý Khóa học
│   ├── pbc-subject-management/   # Quản lý Môn học
│   └── pbc-notification/         # Thông báo & Audit Log
├── shared/
│   └── shared-events/            # Kafka topic constants & event types
├── docs/
│   ├── BUSINESS-OVERVIEW.md      # Mô tả nghiệp vụ chi tiết từng PBC
│   └── EVENT-FLOW.md             # Sơ đồ event flow toàn hệ thống
├── app-contract.json             # Metadata & contract của App
├── pbc-registry.json             # Registry load remote PBC runtime
├── app-asyncapi.yaml             # Event orchestration contract
├── app-openapi.yaml              # BFF API contract
└── docker-compose.yml            # Chạy toàn bộ hệ thống local
```

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| App Shell | React 18, Vite 6, TypeScript 5 |
| Micro Frontend | `@originjs/vite-plugin-federation` 1.3.6 (Module Federation) |
| Micro Service | Node.js / NestJS (mỗi PBC) |
| Event Bus | Apache Kafka 3.x (Confluent Platform 7.6) |
| UI Strategy | Module Federation — shell load PBC qua `remoteEntry.js` |
| i18n | Tiếng Việt (mặc định), Tiếng Anh |

## Danh sách PBC

| PBC | Mô tả | Route | Port |
|-----|-------|-------|------|
| `pbc-auth` | Đăng nhập, phân quyền RBAC, JWT | `/auth` | 3001 |
| `pbc-student-management` | CRUD sinh viên, trạng thái, import/export | `/students` | 3002 |
| `pbc-class-management` | CRUD lớp học, gán sinh viên, chuyển lớp | `/classes` | 3003 |
| `pbc-course-management` | CRUD khóa học, quản lý học kỳ | `/courses` | 3004 |
| `pbc-subject-management` | CRUD môn học, gán vào lớp/khóa | `/subjects` | 3005 |
| `pbc-notification` | Thông báo hệ thống, audit log | `/notifications` | 3006 |

App Shell: `http://localhost:3000`

## Yêu cầu môi trường

- Node.js >= 20
- Docker & Docker Compose >= 2.x
- npm >= 10

## Chạy local

### 1. Khởi động toàn bộ hệ thống bằng Docker

```bash
cd student-management
docker-compose up
```

Sau khi khởi động:
- App Shell: http://localhost:3000
- Kafka broker: `localhost:9092`

### 2. Chạy từng service riêng lẻ (development)

```bash
# App Shell
cd app-shell
npm install
npm run dev

# Một PBC bất kỳ (ví dụ pbc-student-management)
cd pbcs/pbc-student-management/ui
npm install
npm run dev

cd pbcs/pbc-student-management/api
npm install
npm run start:dev
```

### 3. Biến môi trường

Mỗi PBC cần file `.env` tại thư mục `api/`. Tham khảo `api/.env.example` trong từng PBC.

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `KAFKA_BROKERS` | Địa chỉ Kafka broker | `kafka:29092` (Docker) / `localhost:9092` (local) |
| `DATABASE_URL` | Connection string DB | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret ký JWT | _(không commit giá trị thật)_ |

App Shell cần file `.env` tại `app-shell/`:

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `VITE_KAFKA_BROKERS` | Kafka brokers cho shell | `kafka:29092` |

## Event Bus

Hệ thống giao tiếp liên PBC qua **Kafka**. Topic naming convention:

```
pbc.<pbcId>.<aggregate>.<verb>

Ví dụ:
  pbc.student-management.student.created
  pbc.class-management.student.assigned-to-class
  pbc.auth.user.role-changed
```

Xem chi tiết tất cả topics và consumer groups tại [`docs/EVENT-FLOW.md`](./docs/EVENT-FLOW.md).

## Tài liệu

| File | Nội dung |
|------|----------|
| [`docs/BUSINESS-OVERVIEW.md`](./docs/BUSINESS-OVERVIEW.md) | Mô tả nghiệp vụ, data model, API, events từng PBC |
| [`docs/EVENT-FLOW.md`](./docs/EVENT-FLOW.md) | Sơ đồ event flow, bảng topics, payload envelope chuẩn |
| [`app-contract.json`](./app-contract.json) | Metadata & contract của App (nguồn sự thật cấu hình) |
| [`pbc-registry.json`](./pbc-registry.json) | Registry URL remote entry của từng PBC |
| [`app-asyncapi.yaml`](./app-asyncapi.yaml) | Event orchestration contract (AsyncAPI 2.6) |
| [`app-openapi.yaml`](./app-openapi.yaml) | BFF HTTP API contract (OpenAPI 3.1) |

## Roles & Phân quyền

| Role | Mô tả |
|------|-------|
| `ADMIN` | Quản trị toàn hệ thống |
| `ACADEMIC_STAFF` | Ban đào tạo — quản lý lớp, khóa, môn |
| `TEACHER` | Giảng viên — xem danh sách lớp, sinh viên |
| `STUDENT` | Sinh viên — xem thông tin cá nhân, lịch học |

## Quy ước phát triển

- Mỗi PBC là một **bounded context độc lập** — không import code trực tiếp từ PBC khác.
- Giao tiếp liên PBC **chỉ** qua Kafka topic hoặc HTTP theo contract đã công bố.
- Không hard-code topic name trong code — dùng constants từ `shared/shared-events/`.
- Mọi Kafka message phải có envelope chuẩn: `eventId`, `eventType`, `occurredAt`, `tenantId`, `correlationId`, `data`.
- Thêm PBC mới: cập nhật `app-contract.json`, `pbc-registry.json`, `docker-compose.yml` và `docs/`.
