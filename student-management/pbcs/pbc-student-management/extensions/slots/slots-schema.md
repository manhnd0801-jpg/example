# pbc-student-management — Extension Slots Schema

## Slot: StudentListSlot
**Props**: none (tự fetch data)
**Events emitted**: `student.selected`

## Slot: StudentFormSlot
**Props**:
```typescript
interface StudentFormSlotProps {
  studentId?: string;  // undefined = tạo mới, có giá trị = chỉnh sửa
  onSuccess?: () => void;
}
```

## Slot: StudentDetailSlot
**Props**:
```typescript
interface StudentDetailSlotProps {
  studentId: string;
}
```

## Slot: StudentStatusSlot
**Props**:
```typescript
interface StudentStatusSlotProps {
  studentId: string;
  onStatusChange?: (status: string) => void;
}
```
