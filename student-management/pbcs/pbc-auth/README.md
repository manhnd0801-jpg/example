# pbc-auth — Authentication & Authorization

**PBC ID:** `auth`  
**Type:** `full` (UI + API + DB)  
**Version:** 0.1.0

PBC nền tảng cung cấp xác thực JWT và phân quyền RBAC cho toàn bộ Student Management Portal.

## Cấu trúc

```
pbc-auth/
├── pbc-contract.json     # Metadata & contract
├── openapi.yaml          # REST API spec (OpenAPI 3.1)
├── asyncapi.yaml         # Event spec (AsyncAPI 2.6 / Kafka)
├── ui/                   # React + Ant Design (Vite, Module Federation)
├── api/                  # NestJS (TypeORM + PostgreSQL)
├── db/                   # Migrations, seed, tenant-init
├── docker/               # Dockerfile.api, Dockerfile.ui, docker-compose.yml
└── README.md
```

## Chạy local

```bash
# Khởi động DB + API
cd docker
docker-compose up pbc-auth-db pbc-auth-api

# Hoặc chạy API riêng (cần DB đang chạy)
cd api
cp .env.example .env   # điền giá trị thật
npm install
npm run start:dev

# Chạy UI
cd ui
npm install
npm run dev            # http://localhost:3011
```

## API Endpoints

| Method | Path | Mô tả | Auth |
|--------|------|-------|------|
| POST | `/v1/auth/login` | Đăng nhập | Public |
| POST | `/v1/auth/logout` | Đăng xuất | JWT |
| POST | `/v1/auth/refresh` | Gia hạn token | Public |
| POST | `/v1/auth/change-password` | Đổi mật khẩu | JWT |
| GET | `/v1/users` | Danh sách user | JWT + ADMIN |
| POST | `/v1/users` | Tạo user | JWT + ADMIN |
| PUT | `/v1/users/:id` | Cập nhật user | JWT + ADMIN |
| DELETE | `/v1/users/:id` | Xóa user | JWT + ADMIN |
| PATCH | `/v1/users/:id/role` | Đổi role | JWT + ADMIN |
| GET | `/v1/roles` | Danh sách role | JWT |
| GET | `/v1/permissions` | Danh sách permission | JWT |
| GET | `/health` | Liveness | Public |
| GET | `/ready` | Readiness (probe DB) | Public |

## Kafka Topics

| Topic | Direction | Mô tả |
|-------|-----------|-------|
| `pbc.auth.user.logged-in` | Produce | User đăng nhập |
| `pbc.auth.user.logged-out` | Produce | User đăng xuất |
| `pbc.auth.user.created` | Produce | Tạo tài khoản mới |
| `pbc.auth.user.role-changed` | Produce | Thay đổi role |

## UI Slots

| Slot | Component | Mô tả |
|------|-----------|-------|
| `login-form` | `LoginSlot` | Form đăng nhập |
| `profile` | `ProfileSlot` | Thông tin cá nhân & đổi mật khẩu |
| `user-management` | `UserManagementSlot` | Quản lý tài khoản (Admin) |

## Biến môi trường

Xem `api/.env.example` để biết danh sách đầy đủ.

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret ký JWT |
| `KAFKA_BROKERS` | ✅ | Kafka broker addresses |
| `PORT` | | Port API (default: 3001) |
