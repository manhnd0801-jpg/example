-- AI-GENERATED
-- Seed: Dữ liệu mẫu cho môi trường dev/local
-- ⚠️  CHỈ DÙNG CHO DEV/LOCAL — không dùng trên production

INSERT INTO courses (course_code, course_name, duration_years, total_credits, status, tenant_id) VALUES
  ('CNTT',  'Cong nghe thong tin',   4, 140, 'ACTIVE',   'dev-tenant'),
  ('KHMT',  'Khoa hoc may tinh',     4, 135, 'ACTIVE',   'dev-tenant'),
  ('HTTT',  'He thong thong tin',    4, 138, 'UPCOMING', 'dev-tenant')
ON CONFLICT (course_code, tenant_id) DO NOTHING;
