# Student Management System — Yêu cầu Nghiệp vụ

Phiên bản: 1.0.0  
Trạng thái: Draft

---

## 1. Tổng quan App

**Tên App:** `student-management-portal`

**Mục tiêu:** Xây dựng hệ thống quản lý sinh viên hoàn chỉnh theo kiến trúc Composable Platform, gồm 6 PBC độc lập giao tiếp qua Event Bus.

### Các PBC chính

| STT | PBC ID | Tên |
|-----|--------|-----|
| 1 | `pbc-auth` | Login & Phân quyền |
| 2 | `pbc-student-management` | Quản lý Sinh viên |
| 3 | `pbc-class-management` | Quản lý Lớp học |
| 4 | `pbc-course-management` | Quản lý Khóa học |
| 5 | `pbc-subject-management` | Quản lý Môn học |
| 6 | `pbc-notification` | Thông báo – hỗ trợ chung |

---

## 2. Chi tiết từng PBC

### 2.1 Login & Phân quyền (`pbc-auth`)

**Nghiệp vụ chính:**
- Đăng nhập / Đăng xuất
- Quản lý tài khoản người dùng (Admin, Giảng viên, Sinh viên, Ban đào tạo…)
- Phân quyền theo vai trò (Role-Based Access Control)
- Quên mật khẩu, đổi mật khẩu
- JWT Token + Refresh Token
- Session management

**Dữ liệu chính:**
```
User       (id, username, password_hash, email, full_name, role, status…)
Role       (id, name, description)
Permission (id, code, description)
```

**Events:**
- Produces: `AUTH_USER_LOGGED_IN`, `AUTH_USER_LOGGED_OUT`, `USER_ROLE_CHANGED`
- Consumes: _(thường không consume nhiều, chủ yếu là nguồn cung cấp auth)_

**Gợi ý tách PBC:** `pbc-auth`  
UI: Login form, Profile  
Backend: Auth Service

---

### 2.2 Quản lý Sinh viên (`pbc-student-management`)

**Nghiệp vụ chính:**
- CRUD thông tin sinh viên (thêm, sửa, xóa, xem danh sách)
- Tìm kiếm, lọc theo lớp, khóa, trạng thái…
- Quản lý thông tin cá nhân (họ tên, ngày sinh, giới tính, địa chỉ, số điện thoại, email…)
- Quản lý trạng thái sinh viên (đang học, tạm dừng, tốt nghiệp, nghỉ học…)
- Import/Export danh sách sinh viên (Excel)

**Dữ liệu chính:**
```
Student (id, studentCode, fullName, dateOfBirth, gender, address, phone, email, status, classId…)
```

**Events:**
- Produces: `STUDENT_CREATED`, `STUDENT_UPDATED`, `STUDENT_DELETED`, `STUDENT_STATUS_CHANGED`
- Consumes: `CLASS_UPDATED`, `COURSE_ASSIGNED`

**Gợi ý tách PBC:** `pbc-student-management`

---

### 2.3 Quản lý Lớp học (`pbc-class-management`)

**Nghiệp vụ chính:**
- CRUD lớp học (thêm lớp, sửa thông tin lớp, xóa lớp)
- Gán sinh viên vào lớp
- Quản lý thông tin lớp (tên lớp, mã lớp, sĩ số, giảng viên chủ nhiệm, năm học…)
- Chuyển sinh viên giữa các lớp
- Theo dõi tình trạng lớp (đầy, còn chỗ…)

**Dữ liệu chính:**
```
Class (id, classCode, className, academicYear, semester, maxStudents, homeroomTeacherId…)
```

**Events:**
- Produces: `CLASS_CREATED`, `CLASS_UPDATED`, `STUDENT_ASSIGNED_TO_CLASS`, `STUDENT_REMOVED_FROM_CLASS`
- Consumes: `STUDENT_CREATED`, `STUDENT_DELETED`

**Gợi ý tách PBC:** `pbc-class-management`

---

### 2.4 Quản lý Khóa học (`pbc-course-management`)

**Nghiệp vụ chính:**
- CRUD khóa học (chương trình đào tạo)
- Quản lý thông tin khóa học (tên khóa, mã khóa, thời gian bắt đầu/kết thúc, mô tả…)
- Gán môn học vào khóa học
- Quản lý học kỳ trong khóa học

**Dữ liệu chính:**
```
Course (id, courseCode, courseName, startDate, endDate, description…)
```

**Events:**
- Produces: `COURSE_CREATED`, `COURSE_UPDATED`, `COURSE_DELETED`
- Consumes: `SUBJECT_ASSIGNED_TO_COURSE`

**Gợi ý tách PBC:** `pbc-course-management`

---

### 2.5 Quản lý Môn học (`pbc-subject-management`)

**Nghiệp vụ chính:**
- CRUD môn học
- Quản lý thông tin môn (tên môn, mã môn, số tín chỉ, loại môn (bắt buộc/tùy chọn), mô tả…)
- Gán môn học vào lớp học / khóa học
- Quản lý chương trình khung (curriculum)

**Dữ liệu chính:**
```
Subject (id, subjectCode, subjectName, credits, subjectType, description…)
```

**Events:**
- Produces: `SUBJECT_CREATED`, `SUBJECT_UPDATED`, `SUBJECT_ASSIGNED_TO_CLASS`
- Consumes: `COURSE_CREATED`

**Gợi ý tách PBC:** `pbc-subject-management`

---

### 2.6 Thông báo (`pbc-notification`)

**Nghiệp vụ chính:**
- Hiển thị thông báo hệ thống
- Lịch sử hoạt động (audit log)
- Gửi thông báo khi có sự kiện quan trọng (tạo sinh viên, tạo đơn, thay đổi trạng thái…)

**Events:**
- Consumes: Hầu hết các event từ các PBC khác (`STUDENT_CREATED`, `ORDER_CREATED`, `CLASS_UPDATED`…)

**Gợi ý tách PBC:** `pbc-notification`

---

## 3. Mối quan hệ giữa các PBC (Event Flow tổng quan)

```
pbc-student-management  →  publish STUDENT_CREATED          →  pbc-notification nhận
pbc-class-management    →  publish STUDENT_ASSIGNED_TO_CLASS →  pbc-student-management cập nhật
pbc-auth                →  publish USER_ROLE_CHANGED         →  các PBC khác cập nhật quyền
```

> Xem chi tiết sơ đồ event flow và payload chuẩn tại [`EVENT-FLOW.md`](./EVENT-FLOW.md)  
> Xem phân tích nghiệp vụ chi tiết từng PBC tại [`BUSINESS-OVERVIEW.md`](./BUSINESS-OVERVIEW.md)
