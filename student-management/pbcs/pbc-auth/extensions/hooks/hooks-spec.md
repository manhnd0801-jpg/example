# pbc-auth — Extension Hooks Specification

Đây là **spec/template** cho hooks mở rộng — KHÔNG phải code runtime.
Code runtime hooks nằm tại `api/src/infrastructure/hooks/`.

## Before Hooks

### validatePayload
- **Trigger**: Trước mọi request tạo/sửa user, role, permission
- **Input**: `{ payload: Record<string, unknown>, rules: ValidationRule[] }`
- **Output**: void (throw BadRequestException nếu invalid)
- **File**: `api/src/infrastructure/hooks/before/validate-payload.hook.ts`

### enforceTenant
- **Trigger**: Trước mọi operation có tenantId
- **Input**: `{ jwtTenantId?: string, headerTenantId?: string }`
- **Output**: `string` (tenantId đã validate)
- **File**: `api/src/infrastructure/hooks/before/enforce-tenant.hook.ts`

### hashPassword
- **Trigger**: Trước khi lưu user mới hoặc đổi mật khẩu
- **Input**: `{ plainPassword: string }`
- **Output**: `string` (bcrypt hash, salt rounds >= 12)
- **Implementation**: `bcrypt.hash(password, 12)` trong `auth.service.ts`

## After Hooks

### auditLog
- **Trigger**: Sau mọi thao tác CRUD user, role, permission
- **Input**: `AuditEntry { actorId, actorRole, action, resourceType, resourceId, tenantId, correlationId }`
- **Output**: void (async, không block response)
- **File**: `api/src/infrastructure/hooks/after/audit-log.hook.ts`

### emitDomainEvent
- **Trigger**: Sau khi tạo user, đổi role, login, logout
- **Input**: `{ topic: string, data: Record<string, unknown>, tenantId: string, correlationId: string }`
- **Output**: void (async, không block response)
- **File**: `api/src/infrastructure/events/event-publisher.ts`

### invalidateCache
- **Trigger**: Sau khi sửa/xóa user hoặc role
- **Input**: `string[]` (cache keys cần xóa)
- **Output**: void
- **File**: `api/src/infrastructure/hooks/after/invalidate-cache.hook.ts`

## Thêm hook mới

1. Tạo file trong `api/src/infrastructure/hooks/before/` hoặc `after/`
2. Export function với signature rõ ràng
3. Đăng ký trong service tương ứng
4. Cập nhật `pbc-contract.json` → `hooks.before` hoặc `hooks.after`
5. Cập nhật spec này
