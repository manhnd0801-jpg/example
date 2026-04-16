# Student Management Portal — Mô tả Nghiệp vụ Chi tiết

Phiên bản: 1.0.0  
App ID: `student-management-portal`  
Số PBC: 6

---

## Tổng quan kiến trúc

```
pbcs/
├── pbc-auth                  # Authentication & Authorization
├── pbc-student-management    # Quản lý Sinh viên
├── pbc-class-management      # Quản lý Lớp học
├── pbc-course-management     # Quản lý Khóa học
├── pbc-subject-management    # Quản lý Môn học
└── pbc-notification          # Thông báo & Audit Log
```

---

## PBC 1: `pbc-auth` — Login & Phân quyền

### Mục đích
Cung cấp xác thực tập trung và phân quyền theo vai trò cho toàn bộ hệ thống.  
Đây là PBC nền tảng — mọi PBC khác đều phụ thuộc vào token do `pbc-auth` phát hành.

### Type: `full` (UI + API + DB)

### Chức năng chính
| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Form login, xác thực username/password, phát JWT + Refresh Token |
| Đăng xuất | Revoke token, xóa session |
| Quản lý tài khoản | CRUD user (Admin thực hiện), gán role |
| Phân quyền RBAC | Gán Role → Permission, kiểm tra quyền theo resource:action |
| Quên mật khẩu | Gửi email reset, xác thực OTP/link |
| Đổi mật khẩu | Xác thực mật khẩu cũ, cập nhật hash mới |
| Refresh Token | Tự động gia hạn session khi access token hết hạn |
| Session management | Theo dõi phiên đăng nhập, hỗ trợ đăng xuất tất cả thiết bị |

### Dữ liệu chính
```
User          (id, username, passwordHash, email, fullName, role, status, createdAt)
Role          (id, name, description)
Permission    (id, code, resource, action, description)
RolePermission(roleId, permissionId)
RefreshToken  (id, userId, token, expiresAt, revokedAt)
```

### Roles hệ thống
- `ADMIN` — Quản trị toàn hệ thống
- `TEACHER` — Giảng viên
- `STUDENT` — Sinh viên
- `ACADEMIC_STAFF` — Ban đào tạo

### Phân quyền theo Role (RBAC)

| Chức năng | ADMIN | ACADEMIC_STAFF | TEACHER | STUDENT |
|-----------|-------|----------------|---------|---------|
| Quản lý user (`/v1/users`) | ✅ | ✅ | ❌ | ❌ |
| Quản lý role (`/v1/roles`) | ✅ | ❌ | ❌ | ❌ |
| Quản lý permission (`/v1/permissions`) | ✅ | ❌ | ❌ | ❌ |
| Đăng nhập / Đổi mật khẩu | ✅ | ✅ | ✅ | ✅ |

### Bootstrapping — Tài khoản Admin đầu tiên

Hệ thống **không có form đăng ký public**. Đây là hệ thống nội bộ — tài khoản được cấp bởi người quản trị.

**Tài khoản Admin đầu tiên được tạo tự động khi deploy:**
- Chạy `db/seed/99_admin_seed.sql` (tự động qua Docker `docker-entrypoint-initdb.d`)
- Username: `admin` | Password: `Admin@123456` (phải đổi ngay sau lần đăng nhập đầu)
- Tenant: được cấu hình theo môi trường (`dev-tenant` cho dev, tenant thật cho production)

**Sau đó Admin tạo tài khoản cho người dùng khác qua UI hoặc API:**
```
Admin đăng nhập → Quản lý người dùng → Tạo tài khoản → Gửi credentials cho người dùng
```

### Multi-tenancy

Hệ thống hỗ trợ **nhiều trường** (multi-tenant) trên cùng một deployment:

```
tenant-bachkhoa  = Đại học Bách Khoa HN
tenant-fpt       = Đại học FPT
tenant-neu       = Đại học Kinh tế QD
dev-tenant       = Môi trường dev/test
```

**Tenant ID được xác định qua:**
- **JWT claim** (sau khi đăng nhập): `{ tenantId: "bachkhoa", role: "ADMIN", ... }`
- **Header `X-Tenant-Id`**: App Shell inject vào mọi request
- **Subdomain** (production): `bachkhoa.student-portal.vn` → tenant = `bachkhoa`

**Dữ liệu hoàn toàn tách biệt** — sinh viên, giảng viên, lớp học của trường A không thấy được dữ liệu trường B.

**Onboard tenant mới:**
```bash
psql -v tenant_id='bachkhoa' -f db/tenant-init.sql
# → Tạo roles, permissions, admin user cho tenant bachkhoa
```

### API chính
```
POST /v1/auth/login
POST /v1/auth/logout
POST /v1/auth/refresh
POST /v1/auth/forgot-password
POST /v1/auth/reset-password
GET  /v1/users
POST /v1/users
PUT  /v1/users/:id
GET  /v1/roles
POST /v1/roles
```

### Events
| Direction | Topic | Mô tả |
|-----------|-------|-------|
| Produces | `pbc.auth.user.logged-in` | Người dùng đăng nhập thành công |
| Produces | `pbc.auth.user.logged-out` | Người dùng đăng xuất |
| Produces | `pbc.auth.user.role-changed` | Thay đổi role của user |
| Produces | `pbc.auth.user.created` | Tạo tài khoản mới |

### UI Slots
- `login-form` — Form đăng nhập
- `profile` — Trang thông tin cá nhân & đổi mật khẩu
- `user-management` — Danh sách & quản lý tài khoản (Admin)

---

## PBC 2: `pbc-student-management` — Quản lý Sinh viên

### Mục đích
Quản lý toàn bộ thông tin hồ sơ sinh viên trong hệ thống.  
Là nguồn dữ liệu sinh viên (source of truth) cho các PBC khác.

### Type: `full` (UI + API + DB)

### Chức năng chính
| Chức năng | Mô tả |
|-----------|-------|
| Thêm sinh viên | Nhập thông tin cá nhân, gán mã sinh viên tự động |
| Sửa thông tin | Cập nhật hồ sơ cá nhân |
| Xóa sinh viên | Soft delete, lưu lịch sử |
| Xem danh sách | Phân trang, tìm kiếm, lọc theo lớp/khóa/trạng thái |
| Quản lý trạng thái | Đang học / Tạm dừng / Tốt nghiệp / Nghỉ học |
| Import/Export | Nhập danh sách từ Excel, xuất báo cáo |
| Xem hồ sơ chi tiết | Thông tin cá nhân, lớp học, môn học đang theo |

### Dữ liệu chính
```
Student (
  id, studentCode, fullName, dateOfBirth, gender,
  address, phone, email, status, classId,
  enrollmentDate, graduationDate, attributes JSON,
  createdAt, updatedAt, deletedAt
)
```

### Trạng thái sinh viên
```
ACTIVE → SUSPENDED → ACTIVE       (tạm dừng rồi học lại)
ACTIVE → GRADUATED                 (tốt nghiệp)
ACTIVE → DROPPED_OUT               (nghỉ học)
```

### API chính
```
GET    /v1/students
POST   /v1/students
GET    /v1/students/:id
PUT    /v1/students/:id
DELETE /v1/students/:id
PATCH  /v1/students/:id/status
POST   /v1/students/import
GET    /v1/students/export
```

### Events
| Direction | Topic | Mô tả |
|-----------|-------|-------|
| Produces | `pbc.student-management.student.created` | Tạo sinh viên mới |
| Produces | `pbc.student-management.student.updated` | Cập nhật thông tin |
| Produces | `pbc.student-management.student.deleted` | Xóa sinh viên |
| Produces | `pbc.student-management.student.status-changed` | Thay đổi trạng thái |
| Consumes | `pbc.class-management.student.assigned-to-class` | Cập nhật classId khi được gán lớp |
| Consumes | `pbc.auth.user.created` | Liên kết tài khoản với hồ sơ sinh viên |

### UI Slots
- `student-list` — Danh sách sinh viên có tìm kiếm/lọc
- `student-form` — Form thêm/sửa sinh viên
- `student-detail` — Xem chi tiết hồ sơ
- `student-status` — Widget thay đổi trạng thái

---

## PBC 3: `pbc-class-management` — Quản lý Lớp học

### Mục đích
Quản lý lớp học, gán sinh viên vào lớp, theo dõi sĩ số và giảng viên chủ nhiệm.

### Type: `full` (UI + API + DB)

### Chức năng chính
| Chức năng | Mô tả |
|-----------|-------|
| CRUD lớp học | Tạo, sửa, xóa lớp; quản lý mã lớp, tên lớp, năm học |
| Gán sinh viên | Thêm sinh viên vào lớp, kiểm tra sĩ số tối đa |
| Chuyển lớp | Di chuyển sinh viên giữa các lớp |
| Gán giảng viên | Gán giảng viên chủ nhiệm cho lớp |
| Theo dõi sĩ số | Hiển thị số chỗ còn lại, cảnh báo khi đầy |
| Xem danh sách lớp | Lọc theo năm học, học kỳ, trạng thái |

### Dữ liệu chính
```
Class (
  id, classCode, className, academicYear, semester,
  maxStudents, currentStudents, homeroomTeacherId,
  status, attributes JSON, createdAt, updatedAt
)
ClassStudent (classId, studentId, assignedAt, removedAt)
```

### API chính
```
GET    /v1/classes
POST   /v1/classes
GET    /v1/classes/:id
PUT    /v1/classes/:id
DELETE /v1/classes/:id
GET    /v1/classes/:id/students
POST   /v1/classes/:id/students          # Gán sinh viên
DELETE /v1/classes/:id/students/:studentId
POST   /v1/classes/:id/transfer          # Chuyển lớp
```

### Events
| Direction | Topic | Mô tả |
|-----------|-------|-------|
| Produces | `pbc.class-management.class.created` | Tạo lớp mới |
| Produces | `pbc.class-management.class.updated` | Cập nhật thông tin lớp |
| Produces | `pbc.class-management.student.assigned-to-class` | Gán sinh viên vào lớp |
| Produces | `pbc.class-management.student.removed-from-class` | Xóa sinh viên khỏi lớp |
| Consumes | `pbc.student-management.student.created` | Chuẩn bị slot cho sinh viên mới |
| Consumes | `pbc.student-management.student.deleted` | Tự động xóa khỏi lớp khi sinh viên bị xóa |

### UI Slots
- `class-list` — Danh sách lớp học
- `class-form` — Form tạo/sửa lớp
- `class-detail` — Chi tiết lớp + danh sách sinh viên
- `class-assign` — Widget gán sinh viên vào lớp

---

## PBC 4: `pbc-course-management` — Quản lý Khóa học

### Mục đích
Quản lý chương trình đào tạo (khóa học), bao gồm thời gian, học kỳ và các môn học thuộc khóa.

### Type: `full` (UI + API + DB)

### Chức năng chính
| Chức năng | Mô tả |
|-----------|-------|
| CRUD khóa học | Tạo, sửa, xóa chương trình đào tạo |
| Quản lý học kỳ | Định nghĩa học kỳ trong khóa học |
| Gán môn học | Liên kết môn học vào từng học kỳ của khóa |
| Theo dõi tiến độ | Xem trạng thái khóa học (đang mở, kết thúc, sắp mở) |
| Xem danh sách | Lọc theo năm, trạng thái |

### Dữ liệu chính
```
Course (
  id, courseCode, courseName, startDate, endDate,
  description, status, attributes JSON, createdAt, updatedAt
)
CourseSemester (id, courseId, semesterName, semesterOrder, startDate, endDate)
CourseSubject  (courseId, subjectId, semesterId, isRequired)
```

### API chính
```
GET    /v1/courses
POST   /v1/courses
GET    /v1/courses/:id
PUT    /v1/courses/:id
DELETE /v1/courses/:id
GET    /v1/courses/:id/subjects
POST   /v1/courses/:id/subjects     # Gán môn học
DELETE /v1/courses/:id/subjects/:subjectId
```

### Events
| Direction | Topic | Mô tả |
|-----------|-------|-------|
| Produces | `pbc.course-management.course.created` | Tạo khóa học mới |
| Produces | `pbc.course-management.course.updated` | Cập nhật khóa học |
| Produces | `pbc.course-management.course.deleted` | Xóa khóa học |
| Consumes | `pbc.subject-management.subject.assigned-to-course` | Nhận thông báo môn học được gán |

### UI Slots
- `course-list` — Danh sách khóa học
- `course-form` — Form tạo/sửa khóa học
- `course-detail` — Chi tiết khóa + danh sách môn học theo học kỳ

---

## PBC 5: `pbc-subject-management` — Quản lý Môn học

### Mục đích
Quản lý danh mục môn học, số tín chỉ, loại môn và chương trình khung.

### Type: `full` (UI + API + DB)

### Chức năng chính
| Chức năng | Mô tả |
|-----------|-------|
| CRUD môn học | Tạo, sửa, xóa môn học |
| Quản lý tín chỉ | Số tín chỉ lý thuyết, thực hành |
| Phân loại môn | Bắt buộc / Tự chọn / Tự chọn tự do |
| Gán vào lớp/khóa | Liên kết môn học với lớp học hoặc khóa học |
| Chương trình khung | Quản lý curriculum theo ngành/chuyên ngành |

### Dữ liệu chính
```
Subject (
  id, subjectCode, subjectName, credits, theoryCredits,
  practiceCredits, subjectType, description,
  attributes JSON, createdAt, updatedAt
)
SubjectClass  (subjectId, classId, semester, teacherId)
```

### API chính
```
GET    /v1/subjects
POST   /v1/subjects
GET    /v1/subjects/:id
PUT    /v1/subjects/:id
DELETE /v1/subjects/:id
POST   /v1/subjects/:id/assign-to-class
POST   /v1/subjects/:id/assign-to-course
```

### Events
| Direction | Topic | Mô tả |
|-----------|-------|-------|
| Produces | `pbc.subject-management.subject.created` | Tạo môn học mới |
| Produces | `pbc.subject-management.subject.updated` | Cập nhật môn học |
| Produces | `pbc.subject-management.subject.assigned-to-class` | Gán môn vào lớp |
| Produces | `pbc.subject-management.subject.assigned-to-course` | Gán môn vào khóa học |
| Consumes | `pbc.course-management.course.created` | Chuẩn bị danh sách môn cho khóa mới |

### UI Slots
- `subject-list` — Danh sách môn học
- `subject-form` — Form tạo/sửa môn học
- `subject-detail` — Chi tiết môn học
- `subject-assign` — Widget gán môn vào lớp/khóa

---

## PBC 6: `pbc-notification` — Thông báo & Audit Log

### Mục đích
PBC hỗ trợ chung — lắng nghe event từ tất cả PBC khác, lưu audit log và gửi thông báo đến người dùng.

### Type: `full` (UI + API + DB)

### Chức năng chính
| Chức năng | Mô tả |
|-----------|-------|
| Hiển thị thông báo | Bell icon, danh sách thông báo chưa đọc/đã đọc |
| Gửi thông báo | Push notification khi có sự kiện quan trọng |
| Audit log | Lưu lịch sử mọi thao tác quan trọng trong hệ thống |
| Đánh dấu đã đọc | Đánh dấu từng thông báo hoặc tất cả |
| Lọc thông báo | Theo loại, thời gian, trạng thái đọc |

### Dữ liệu chính
```
Notification (
  id, userId, title, body, type, referenceId,
  referenceType, isRead, readAt, createdAt
)
AuditLog (
  id, actorId, actorRole, action, resourceType,
  resourceId, payload JSON, tenantId, createdAt
)
```

### Events Consumed (lắng nghe từ tất cả PBC)
| Topic | Hành động |
|-------|-----------|
| `pbc.auth.user.created` | Thông báo tạo tài khoản mới |
| `pbc.auth.user.role-changed` | Thông báo thay đổi quyền |
| `pbc.student-management.student.created` | Thông báo sinh viên mới |
| `pbc.student-management.student.status-changed` | Thông báo thay đổi trạng thái sinh viên |
| `pbc.class-management.class.created` | Thông báo lớp mới |
| `pbc.class-management.student.assigned-to-class` | Thông báo gán lớp cho sinh viên |
| `pbc.course-management.course.created` | Thông báo khóa học mới |
| `pbc.subject-management.subject.assigned-to-class` | Thông báo gán môn vào lớp |

### API chính
```
GET   /v1/notifications
PATCH /v1/notifications/:id/read
PATCH /v1/notifications/read-all
GET   /v1/audit-logs
```

### UI Slots
- `notification-bell` — Icon chuông + badge số chưa đọc (nhúng vào Navbar)
- `notification-list` — Danh sách thông báo
- `audit-log` — Lịch sử hoạt động (Admin)
