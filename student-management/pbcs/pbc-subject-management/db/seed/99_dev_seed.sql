-- AI-GENERATED
-- Seed: Dữ liệu mẫu cho môi trường dev/local
-- ⚠️  CHỈ DÙNG CHO DEV/LOCAL — không dùng trên production

INSERT INTO subjects (subject_code, subject_name, theory_credits, practice_credits, total_credits, subject_type, tenant_id) VALUES
  ('MATH101', 'Giai tich 1',              3, 0, 3, 'REQUIRED',  'dev-tenant'),
  ('MATH102', 'Giai tich 2',              3, 0, 3, 'REQUIRED',  'dev-tenant'),
  ('CS101',   'Lap trinh co ban',         2, 1, 3, 'REQUIRED',  'dev-tenant'),
  ('CS102',   'Cau truc du lieu',         2, 1, 3, 'REQUIRED',  'dev-tenant'),
  ('CS201',   'Co so du lieu',            2, 1, 3, 'REQUIRED',  'dev-tenant'),
  ('CS301',   'Lap trinh web',            2, 1, 3, 'ELECTIVE',  'dev-tenant'),
  ('PE101',   'Giao duc the chat 1',      0, 1, 1, 'REQUIRED',  'dev-tenant')
ON CONFLICT (subject_code, tenant_id) DO NOTHING;
