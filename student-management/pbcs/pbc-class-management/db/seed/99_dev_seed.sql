-- AI-GENERATED
-- Seed: Dữ liệu mẫu cho môi trường dev/local
-- ⚠️  CHỈ DÙNG CHO DEV/LOCAL — không dùng trên production

INSERT INTO classes (class_code, class_name, academic_year, max_students, status, tenant_id) VALUES
  ('CS2026A', 'Khoa hoc may tinh - Nhom A', '2025-2026', 40, 'ACTIVE',  'dev-tenant'),
  ('CS2026B', 'Khoa hoc may tinh - Nhom B', '2025-2026', 40, 'ACTIVE',  'dev-tenant'),
  ('IT2026A', 'Cong nghe thong tin - Nhom A', '2025-2026', 35, 'PLANNED', 'dev-tenant')
ON CONFLICT (class_code, tenant_id) DO NOTHING;
