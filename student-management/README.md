# Student Management Portal

Composed App quản lý sinh viên được xây dựng trên VNPT Composable Platform.

## PBCs được compose

| PBC | Version | Route | Port |
|-----|---------|-------|------|
| student-profile | 1.0.0 | /students | 3001 |
| course-management | 1.0.0 | /courses | 3002 |
| enrollment-management | 1.0.0 | /enrollments | 3003 |

## Chạy local

```bash
docker-compose up
```

App Shell: http://localhost:3000

## Cấu trúc

- `app-shell/` — React host shell (Module Federation)
- `pbcs/` — Các PBC được compose
- `shared/` — Shared packages (ui, events, utils)
- `app-contract.json` — Metadata & contract của App
- `pbc-registry.json` — Registry load remote PBC runtime
