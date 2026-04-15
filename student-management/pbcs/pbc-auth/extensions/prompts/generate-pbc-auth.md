# Prompt Template: Generate pbc-auth

Dùng prompt này khi cần AI tái sinh hoặc mở rộng pbc-auth.

## Context cần cung cấp cho AI

```
Đọc các file sau trước khi generate:
- blueprint/PBC-BLUEPRINT.md
- student-management/pbcs/pbc-auth/pbc-contract.json
- student-management/pbcs/pbc-auth/openapi.yaml
- student-management/pbcs/pbc-auth/asyncapi.yaml
- student-management/docs/BUSINESS-OVERVIEW.md (phần PBC 1)
```

## Prompt mẫu — Thêm endpoint mới

```
Dựa vào pbc-contract.json và openapi.yaml của pbc-auth,
thêm endpoint POST /v1/auth/forgot-password với:
- Request: { email: string }
- Response: SuccessResponse
- Gửi email reset qua SMTP (đọc config từ env)
- Lưu reset token vào attributes của user (hashed)
- Tuân thủ Flexible Payload { data, metadata }
- Thêm comment // AI-GENERATED
- Không hard-code tenant, email, hay secret
```

## Prompt mẫu — Thêm slot mới

```
Dựa vào pbc-contract.json và extensions/slots/slots-schema.md,
tạo RoleManagementSlot.tsx với:
- Danh sách role (Table)
- Tạo/sửa role (Modal + Form)
- Gán permission cho role (Checkbox group)
- Dùng Ant Design
- Slot là thin wrapper, logic trong components/business/
- Thêm comment // AI-GENERATED
```
