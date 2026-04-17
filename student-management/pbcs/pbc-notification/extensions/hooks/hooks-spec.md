# pbc-notification — Extension Hooks Specification

## Before Hooks
### validatePayload
- Validate payload thông báo trước khi gửi

## After Hooks
### auditLog
- Log sau mọi thao tác gửi/đọc thông báo

### emitDomainEvent
- Emit sau khi thông báo được đọc hoặc dismissed
