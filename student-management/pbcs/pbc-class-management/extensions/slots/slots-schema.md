# pbc-class-management — Extension Slots Schema

## Slot: ClassListSlot
**Props**: none
**Events emitted**: `class.selected`

## Slot: ClassFormSlot
**Props**:
```typescript
interface ClassFormSlotProps {
  classId?: string;
  onSuccess?: () => void;
}
```

## Slot: ClassDetailSlot
**Props**:
```typescript
interface ClassDetailSlotProps {
  classId: string;
}
```

## Slot: ClassAssignSlot
**Props**:
```typescript
interface ClassAssignSlotProps {
  classId: string;
  onAssigned?: () => void;
}
```
