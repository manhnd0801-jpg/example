# pbc-auth — Webhook Template

## Cấu hình

Đặt `WEBHOOK_URL` trong `.env` để kích hoạt webhook.
Nếu không đặt, webhook bị bỏ qua (không lỗi).

## Payload mẫu

```json
{
  "event": "pbc.auth.user.created",
  "tenantId": "<tenant-id>",
  "occurredAt": "2026-04-15T10:00:00.000Z",
  "data": {
    "userId": "uuid",
    "username": "john.doe",
    "email": "john@example.com",
    "role": "STUDENT"
  }
}
```

## Events được gửi qua webhook

| Event | Mô tả |
|-------|-------|
| `pbc.auth.user.created` | Tạo tài khoản mới |
| `pbc.auth.user.role-changed` | Thay đổi role |
| `pbc.auth.user.logged-in` | Đăng nhập thành công |
| `pbc.auth.user.logged-out` | Đăng xuất |

## Retry policy

Hiện tại: fire-and-forget, không retry.
Production: cân nhắc thêm retry với exponential backoff.

## Implementation

`api/src/infrastructure/webhook/webhook.service.ts`
