# Student Management Portal — Event Flow

Phiên bản: 1.0.0  
Message Broker: Kafka  
Topic prefix convention: `pbc.<pbcId>.<aggregate>.<verb>`

---

## Sơ đồ tổng quan Event Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KAFKA EVENT BUS                                      │
│                                                                             │
│  pbc.auth.*                                                                 │
│  pbc.student-management.*                                                   │
│  pbc.class-management.*                                                     │
│  pbc.course-management.*                                                    │
│  pbc.subject-management.*                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
        ▲  │         ▲  │         ▲  │         ▲  │         ▲  │
        │  ▼         │  ▼         │  ▼         │  ▼         │  ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
   │pbc-auth │  │pbc-     │  │pbc-     │  │pbc-     │  │pbc-     │
   │         │  │student  │  │class    │  │course   │  │subject  │
   │         │  │-mgmt    │  │-mgmt    │  │-mgmt    │  │-mgmt    │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘
        │            │            │            │            │
        └────────────┴────────────┴────────────┴────────────┘
                                  │
                                  ▼ (consumes all)
                          ┌───────────────┐
                          │ pbc-          │
                          │ notification  │
                          └───────────────┘
```

---

## Flow 1: Đăng nhập & Khởi tạo Session

```
User (Browser)
    │
    ├─[POST /v1/auth/login]──► pbc-auth
    │                               │
    │                               ├─ Xác thực credentials
    │                               ├─ Phát JWT + Refresh Token
    │                               │
    │                               └─ publish ──► pbc.auth.user.logged-in
    │                                                   │
    │◄──[JWT Token]──────────────────                   └──► pbc-notification
    │                                                         (ghi audit log)
    │
    └─[Mọi request tiếp theo đính kèm JWT]──► App Shell guard route
```

**Topics:**
- `pbc.auth.user.logged-in` → payload: `{ userId, role, tenantId, timestamp }`

---

## Flow 2: Tạo Tài khoản → Liên kết Sinh viên

```
Admin
    │
    ├─[POST /v1/users]──► pbc-auth
    │                          │
    │                          ├─ Tạo User record
    │                          └─ publish ──► pbc.auth.user.created
    │                                              │
    │                                    ┌─────────┴──────────┐
    │                                    ▼                    ▼
    │                          pbc-student-management   pbc-notification
    │                          (liên kết userId với     (thông báo admin)
    │                           studentCode nếu có)
    │
    └─[POST /v1/students]──► pbc-student-management
                                    │
                                    ├─ Tạo Student record
                                    └─ publish ──► pbc.student-management.student.created
                                                        │
                                               ┌────────┴────────┐
                                               ▼                 ▼
                                      pbc-class-management  pbc-notification
                                      (chuẩn bị slot)       (thông báo)
```

**Topics:**
- `pbc.auth.user.created` → payload: `{ userId, username, email, role, tenantId }`
- `pbc.student-management.student.created` → payload: `{ studentId, studentCode, fullName, classId, tenantId }`

---

## Flow 3: Gán Sinh viên vào Lớp

```
Academic Staff
    │
    ├─[POST /v1/classes/:id/students]──► pbc-class-management
    │                                           │
    │                                           ├─ Kiểm tra sĩ số tối đa
    │                                           ├─ Tạo ClassStudent record
    │                                           ├─ Tăng currentStudents
    │                                           │
    │                                           └─ publish ──► pbc.class-management.student.assigned-to-class
    │                                                               │
    │                                                    ┌──────────┴──────────┐
    │                                                    ▼                     ▼
    │                                        pbc-student-management      pbc-notification
    │                                        (cập nhật classId           (thông báo sinh viên
    │                                         trong Student record)       được gán lớp)
    │
    └─[Response: 200 OK]
```

**Topics:**
- `pbc.class-management.student.assigned-to-class` → payload: `{ classId, studentId, classCode, className, tenantId }`

---

## Flow 4: Thay đổi Trạng thái Sinh viên

```
Academic Staff / Admin
    │
    ├─[PATCH /v1/students/:id/status]──► pbc-student-management
    │                                           │
    │                                           ├─ Validate transition (ACTIVE → GRADUATED...)
    │                                           ├─ Cập nhật status
    │                                           │
    │                                           └─ publish ──► pbc.student-management.student.status-changed
    │                                                               │
    │                                                    ┌──────────┴──────────┐
    │                                                    ▼                     ▼
    │                                        pbc-class-management        pbc-notification
    │                                        (nếu DROPPED_OUT/           (thông báo sinh viên
    │                                         GRADUATED → tự động         và admin)
    │                                         remove khỏi lớp)
    │
    └─[Response: 200 OK]
```

**Topics:**
- `pbc.student-management.student.status-changed` → payload: `{ studentId, oldStatus, newStatus, tenantId }`

---

## Flow 5: Tạo Khóa học → Gán Môn học

```
Academic Staff
    │
    ├─[POST /v1/courses]──► pbc-course-management
    │                               │
    │                               ├─ Tạo Course record
    │                               └─ publish ──► pbc.course-management.course.created
    │                                                   │
    │                                                   ▼
    │                                        pbc-subject-management
    │                                        (chuẩn bị danh sách môn
    │                                         có thể gán cho khóa mới)
    │
    ├─[POST /v1/subjects/:id/assign-to-course]──► pbc-subject-management
    │                                                   │
    │                                                   ├─ Tạo CourseSubject record
    │                                                   └─ publish ──► pbc.subject-management.subject.assigned-to-course
    │                                                                       │
    │                                                                       ▼
    │                                                             pbc-course-management
    │                                                             (cập nhật danh sách môn
    │                                                              trong khóa học)
    │
    └─[Response: 200 OK]
```

**Topics:**
- `pbc.course-management.course.created` → payload: `{ courseId, courseCode, courseName, tenantId }`
- `pbc.subject-management.subject.assigned-to-course` → payload: `{ subjectId, courseId, semesterId, isRequired, tenantId }`

---

## Flow 6: Gán Môn học vào Lớp

```
Academic Staff
    │
    ├─[POST /v1/subjects/:id/assign-to-class]──► pbc-subject-management
    │                                                   │
    │                                                   ├─ Tạo SubjectClass record
    │                                                   └─ publish ──► pbc.subject-management.subject.assigned-to-class
    │                                                                       │
    │                                                            ┌──────────┴──────────┐
    │                                                            ▼                     ▼
    │                                                  pbc-class-management      pbc-notification
    │                                                  (cập nhật danh sách       (thông báo sinh viên
    │                                                   môn của lớp)              trong lớp)
    │
    └─[Response: 200 OK]
```

**Topics:**
- `pbc.subject-management.subject.assigned-to-class` → payload: `{ subjectId, classId, semester, teacherId, tenantId }`

---

## Flow 7: Thay đổi Role → Cập nhật Quyền

```
Admin
    │
    ├─[PUT /v1/users/:id]──► pbc-auth (đổi role)
    │                               │
    │                               ├─ Cập nhật User.role
    │                               └─ publish ──► pbc.auth.user.role-changed
    │                                                   │
    │                                        ┌──────────┴──────────┐
    │                                        ▼                     ▼
    │                              pbc-notification          (các PBC khác
    │                              (thông báo user           có thể invalidate
    │                               bị đổi quyền)            permission cache)
    │
    └─[Response: 200 OK]
```

**Topics:**
- `pbc.auth.user.role-changed` → payload: `{ userId, oldRole, newRole, tenantId }`

---

## Flow 8: Xóa Sinh viên → Cascade

```
Admin
    │
    ├─[DELETE /v1/students/:id]──► pbc-student-management
    │                                       │
    │                                       ├─ Soft delete Student record
    │                                       └─ publish ──► pbc.student-management.student.deleted
    │                                                           │
    │                                              ┌───────────┴───────────┐
    │                                              ▼                       ▼
    │                                    pbc-class-management        pbc-notification
    │                                    (xóa khỏi ClassStudent,     (ghi audit log)
    │                                     giảm currentStudents)
    │
    └─[Response: 200 OK]
```

**Topics:**
- `pbc.student-management.student.deleted` → payload: `{ studentId, studentCode, tenantId }`

---

## Bảng tổng hợp tất cả Topics

| Topic | Producer | Consumers |
|-------|----------|-----------|
| `pbc.auth.user.logged-in` | pbc-auth | pbc-notification |
| `pbc.auth.user.logged-out` | pbc-auth | pbc-notification |
| `pbc.auth.user.created` | pbc-auth | pbc-student-management, pbc-notification |
| `pbc.auth.user.role-changed` | pbc-auth | pbc-notification |
| `pbc.student-management.student.created` | pbc-student-management | pbc-class-management, pbc-notification |
| `pbc.student-management.student.updated` | pbc-student-management | pbc-notification |
| `pbc.student-management.student.deleted` | pbc-student-management | pbc-class-management, pbc-notification |
| `pbc.student-management.student.status-changed` | pbc-student-management | pbc-class-management, pbc-notification |
| `pbc.class-management.class.created` | pbc-class-management | pbc-notification |
| `pbc.class-management.class.updated` | pbc-class-management | pbc-notification |
| `pbc.class-management.student.assigned-to-class` | pbc-class-management | pbc-student-management, pbc-notification |
| `pbc.class-management.student.removed-from-class` | pbc-class-management | pbc-student-management, pbc-notification |
| `pbc.course-management.course.created` | pbc-course-management | pbc-subject-management, pbc-notification |
| `pbc.course-management.course.updated` | pbc-course-management | pbc-notification |
| `pbc.course-management.course.deleted` | pbc-course-management | pbc-notification |
| `pbc.subject-management.subject.created` | pbc-subject-management | pbc-notification |
| `pbc.subject-management.subject.updated` | pbc-subject-management | pbc-notification |
| `pbc.subject-management.subject.assigned-to-class` | pbc-subject-management | pbc-class-management, pbc-notification |
| `pbc.subject-management.subject.assigned-to-course` | pbc-subject-management | pbc-course-management, pbc-notification |

---

## Consumer Groups (Kafka)

Mỗi PBC consumer dùng một `groupId` riêng để đảm bảo mỗi PBC nhận đủ message:

| Consumer Group | PBC | Topics subscribe |
|----------------|-----|-----------------|
| `cg.student-mgmt` | pbc-student-management | `pbc.class-management.student.assigned-to-class`, `pbc.auth.user.created` |
| `cg.class-mgmt` | pbc-class-management | `pbc.student-management.student.created`, `pbc.student-management.student.deleted`, `pbc.student-management.student.status-changed`, `pbc.subject-management.subject.assigned-to-class` |
| `cg.course-mgmt` | pbc-course-management | `pbc.subject-management.subject.assigned-to-course` |
| `cg.subject-mgmt` | pbc-subject-management | `pbc.course-management.course.created` |
| `cg.notification` | pbc-notification | **tất cả topics** |

---

## Payload chuẩn (Envelope)

Mọi Kafka message đều wrap theo chuẩn:

```json
{
  "eventId": "uuid-v4",
  "eventType": "pbc.student-management.student.created",
  "schemaVersion": "1.0",
  "occurredAt": "2026-04-15T10:00:00.000Z",
  "tenantId": "tenant-001",
  "correlationId": "corr-xyz789",
  "data": {
    // payload nghiệp vụ cụ thể của từng event
  }
}
```

| Field | Mô tả |
|-------|-------|
| `eventId` | UUID duy nhất, dùng cho idempotency |
| `eventType` | Tên topic đầy đủ |
| `schemaVersion` | Version schema payload, tăng khi breaking change |
| `occurredAt` | Thời điểm event xảy ra (ISO 8601) |
| `tenantId` | Tenant context |
| `correlationId` | Trace xuyên suốt request gốc |
| `data` | Payload nghiệp vụ |
