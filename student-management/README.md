# Student Management Portal

Hệ thống quản lý sinh viên xây dựng theo kiến trúc **Micro Frontend + Microservice** trên VNPT Composable Platform.

## Yêu cầu môi trường

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Docker | >= 24.x |
| Docker Compose | >= 2.x |
| Node.js _(chỉ cần khi dev local)_ | >= 20 |
| npm _(chỉ cần khi dev local)_ | >= 10 |

---

## Khởi động nhanh (Docker)

> Chạy toàn bộ hệ thống chỉ với 2 lệnh.

```bash
# 1. Clone repo và vào thư mục
git clone <repo-url>
cd student-management

# 2. Build và khởi động
docker compose -p student-mgmt up --build pbc-auth-db pbc-auth-api pbc-auth-ui app-shell
```

Sau khi khởi động (~2-3 phút lần đầu):

| Service | URL |
|---------|-----|
| **App Shell** | http://localhost:3010 |
| pbc-auth API | http://localhost:3001 |
| pbc-auth UI | http://localhost:3011 |

**Tài khoản mặc định:**

| Trường | Giá trị |
|--------|---------|
| Username | `admin` |
| Password | `Admin@123456` |
| Tenant | `dev-tenant` |

> ⚠️ Đổi mật khẩu sau khi đăng nhập lần đầu.

---

## Cấu trúc dự án

```
student-management/
├── app-shell/                    # React host shell (Module Federation, port 3010)
├── pbcs/
│   └── pbc-auth/                 # Authentication & Authorization (port 3001/3011)
│       ├── api/                  # NestJS API
│       ├── ui/                   # React UI (Ant Design)
│       ├── db/                   # PostgreSQL migrations & seed
│       └── docker/               # Dockerfile + docker-compose.dev.yml
├── shared/
│   └── shared-events/            # Kafka topic constants & event types
├── docs/
│   ├── REQUIREMENTS.md           # Yêu cầu nghiệp vụ gốc
│   ├── BUSINESS-OVERVIEW.md      # Mô tả chi tiết từng PBC
│   └── EVENT-FLOW.md             # Sơ đồ event flow toàn hệ thống
├── app-contract.json             # Metadata & contract của App
├── pbc-registry.json             # Registry URL remote entry của từng PBC
├── docker-compose.yml            # Compose toàn hệ thống
└── README.md
```

---

## Port convention

| Service | Port | Mô tả |
|---------|------|-------|
| App Shell | 3010 | Nginx serve React build |
| pbc-auth API | 3001 | NestJS REST API |
| pbc-auth UI | 3011 | Nginx serve pbc-auth React build |
| pbc-auth DB | 5433 | PostgreSQL (host port, tránh conflict) |
| pbc-student-profile UI | 3012 | _(chưa implement)_ |
| pbc-course-management UI | 3013 | _(chưa implement)_ |
| pbc-enrollment-management UI | 3014 | _(chưa implement)_ |

---

## Chạy từng PBC độc lập (dev)

Khi phát triển một PBC, không cần chạy toàn bộ stack:

```bash
# Chạy chỉ pbc-auth (API + UI + DB, không cần Kafka)
docker compose -p pbc-auth -f pbcs/pbc-auth/docker/docker-compose.dev.yml up --build

# Truy cập UI standalone của pbc-auth
open http://localhost:3011
```

Tài khoản dev: `admin` / `Admin@123456` / tenant `dev-tenant`

---

## Phát triển App Shell

```bash
cd app-shell

# Cài dependencies
npm install

# Chạy dev server (port 3010)
# Yêu cầu pbc-auth đang chạy ở port 3011
npm run dev

# Build production
npm run build
```

Biến môi trường (`app-shell/.env`):

```env
VITE_KAFKA_BROKERS=localhost:9092
VITE_TENANT_ID=dev-tenant
```

---

## Thêm PBC mới

1. Tạo thư mục `pbcs/pbc-<name>/` theo cấu trúc PBC-BLUEPRINT.md
2. Thêm vào `app-contract.json`:
   ```json
   { "pbcId": "<name>", "version": "1.0.0" }
   ```
3. Thêm vào `pbc-registry.json`:
   ```json
   {
     "pbcId": "<name>",
     "remoteUrl": "http://localhost:<port>/assets/remoteEntry.js",
     "scope": "pbc_<name_snake>",
     "module": "./bootstrap",
     "routePrefix": "/<path>",
     "enabled": true
   }
   ```
4. Thêm service vào `docker-compose.yml`
5. Thêm import literal vào `app-shell/src/core/remote-imports.ts`
6. Cập nhật `docs/`

---

## Roles & Phân quyền

| Role | Quyền |
|------|-------|
| `ADMIN` | Toàn quyền — quản lý user, role, permission |
| `ACADEMIC_STAFF` | Quản lý user, sinh viên, lớp, khóa, môn |
| `TEACHER` | Xem danh sách lớp, sinh viên |
| `STUDENT` | Xem thông tin cá nhân |

---

## Tài liệu

| File | Nội dung |
|------|----------|
| [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md) | Yêu cầu nghiệp vụ gốc |
| [`docs/BUSINESS-OVERVIEW.md`](./docs/BUSINESS-OVERVIEW.md) | Mô tả chi tiết từng PBC |
| [`docs/EVENT-FLOW.md`](./docs/EVENT-FLOW.md) | Event flow, Kafka topics, payload chuẩn |
| [`app-contract.json`](./app-contract.json) | Contract của App |
| [`pbc-registry.json`](./pbc-registry.json) | Registry URL remote entry |
| [`blueprint/PBC-BLUEPRINT.md`](../blueprint/PBC-BLUEPRINT.md) | Quy chuẩn sinh PBC |
| [`blueprint/APP-BLUEPRINTV2.md`](../blueprint/APP-BLUEPRINTV2.md) | Quy chuẩn sinh App |

---

## Troubleshooting

**Trang trắng khi vào http://localhost:3010**
- Kiểm tra pbc-auth-ui đang chạy: `docker ps | grep pbc-auth-ui`
- Kiểm tra proxy: `curl http://localhost:3010/remote/pbc-auth/assets/remoteEntry.js`

**Login lỗi "Tên đăng nhập hoặc mật khẩu không đúng"**
- Đảm bảo gửi đúng `tenantId: "dev-tenant"` trong request
- Kiểm tra DB đã seed: `docker exec student-mgmt-pbc-auth-db-1 psql -U postgres -d pbc_auth -c "SELECT username FROM users;"`

**Port conflict**
- Port 5432 bị chiếm: pbc-auth-db dùng host port 5433 để tránh conflict
- Port 9092 bị chiếm: dừng Kafka của project khác hoặc bỏ service kafka khỏi lệnh up

**Rebuild sau khi sửa code**
```bash
docker compose -p student-mgmt -f docker-compose.yml build <service-name>
docker compose -p student-mgmt -f docker-compose.yml up -d <service-name>
```
