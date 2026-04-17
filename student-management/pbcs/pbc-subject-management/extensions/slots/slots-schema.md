# pbc-subject-management — Extension Slots Schema

## Slot: SubjectListSlot
**Props**: none

## Slot: SubjectFormSlot
**Props**:
```typescript
interface SubjectFormSlotProps {
  subjectId?: string;
  onSuccess?: () => void;
}
```

## Slot: SubjectDetailSlot
**Props**:
```typescript
interface SubjectDetailSlotProps {
  subjectId: string;
}
```

## Slot: SubjectAssignSlot
**Props**:
```typescript
interface SubjectAssignSlotProps {
  courseId: string;
  onAssigned?: () => void;
}
```
