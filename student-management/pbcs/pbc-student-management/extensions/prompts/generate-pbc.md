# pbc-student-management — AI Generation Prompt

Dùng file này làm context khi yêu cầu AI generate code cho PBC này.

## Domain
Quản lý thông tin sinh viên: hồ sơ, trạng thái, lớp học.

## Entities
- Student: studentCode, fullName, email, phone, dateOfBirth, status, classId

## Key Rules
- studentCode phải unique trong tenant
- Không xóa cứng — dùng status = INACTIVE
