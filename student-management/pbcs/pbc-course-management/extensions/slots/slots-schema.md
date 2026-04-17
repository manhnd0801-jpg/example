# pbc-course-management — Extension Slots Schema

## Slot: CourseListSlot
**Props**: none

## Slot: CourseFormSlot
**Props**:
```typescript
interface CourseFormSlotProps {
  courseId?: string;
  onSuccess?: () => void;
}
```

## Slot: CourseDetailSlot
**Props**:
```typescript
interface CourseDetailSlotProps {
  courseId: string;
}
```
