-- AI-GENERATED
-- Seed: Dữ liệu mẫu cho môi trường dev/local
-- File này được PostgreSQL tự chạy khi init container lần đầu
-- ⚠️  CHỈ DÙNG CHO DEV/LOCAL — không dùng trên production

INSERT INTO students (student_code, full_name, email, status, tenant_id) VALUES
  ('SV2026001', 'Nguyen Van An',   'an.nguyen@dev.local',   'ACTIVE', 'dev-tenant'),
  ('SV2026002', 'Tran Thi Binh',   'binh.tran@dev.local',   'ACTIVE', 'dev-tenant'),
  ('SV2026003', 'Le Van Cuong',    'cuong.le@dev.local',    'ACTIVE', 'dev-tenant'),
  ('SV2026004', 'Pham Thi Dung',   'dung.pham@dev.local',   'ACTIVE', 'dev-tenant'),
  ('SV2026005', 'Hoang Van Em',    'em.hoang@dev.local',    'SUSPENDED', 'dev-tenant')
ON CONFLICT (student_code, tenant_id) DO NOTHING;
