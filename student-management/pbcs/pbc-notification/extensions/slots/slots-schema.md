# pbc-notification — Extension Slots Schema

## Slot: NotificationBellSlot
**Props**:
```typescript
interface NotificationBellSlotProps {
  userId?: string;
}
```
**Events consumed**: `notification.triggered`

## Slot: NotificationListSlot
**Props**: none

## Slot: AuditLogSlot
**Props**:
```typescript
interface AuditLogSlotProps {
  resourceType?: string;
  resourceId?: string;
}
```
