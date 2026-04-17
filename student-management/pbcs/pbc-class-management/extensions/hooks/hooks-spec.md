# pbc-class-management — Extension Hooks Specification

## Before Hooks
### validatePayload
- Validate trước khi tạo/sửa lớp học

### enforceTenant
- Enforce tenant context

## After Hooks
### auditLog
- Log sau mọi thao tác CRUD lớp học

### emitDomainEvent
- Emit sau khi tạo, cập nhật, xóa lớp học
