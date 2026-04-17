# pbc-student-management — Extension Hooks Specification

Code runtime hooks nằm tại `api/src/infrastructure/hooks/`.

## Before Hooks

### validatePayload
- **Trigger**: Trước mọi request tạo/sửa sinh viên
- **Input**: `{ payload: Record<string, unknown>, rules: ValidationRule[] }`
- **Output**: void (throw BadRequestException nếu invalid)

### enforceTenant
- **Trigger**: Trước mọi operation có tenantId
- **Input**: `{ jwtTenantId?: string, headerTenantId?: string }`
- **Output**: `string` (tenantId đã validate)

## After Hooks

### auditLog
- **Trigger**: Sau mọi thao tác CRUD sinh viên
- **Input**: `AuditEntry { actorId, actorRole, action, resourceType, resourceId, tenantId }`
- **Output**: void (async)

### emitDomainEvent
- **Trigger**: Sau khi tạo, cập nhật, xóa sinh viên
- **Input**: `{ topic: string, data: Record<string, unknown> }`
- **Output**: void (async)
