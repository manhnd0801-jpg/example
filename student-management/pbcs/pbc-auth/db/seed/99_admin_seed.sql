-- AI-GENERATED
-- Seed: Tạo dữ liệu mặc định cho môi trường dev
-- File này được PostgreSQL tự chạy khi init container lần đầu
-- (đặt trong /docker-entrypoint-initdb.d/ với prefix 99_ để chạy sau migrations)
--
-- Tài khoản mặc định:
--   username : admin
--   password : Admin@123456
--   tenant   : dev-tenant
--
-- ⚠️  CHỈ DÙNG CHO DEV/LOCAL — không dùng trên production

-- Roles
INSERT INTO roles (name, description, tenant_id) VALUES
  ('ADMIN',          'Quan tri toan he thong', 'dev-tenant'),
  ('TEACHER',        'Giang vien',             'dev-tenant'),
  ('STUDENT',        'Sinh vien',              'dev-tenant'),
  ('ACADEMIC_STAFF', 'Ban dao tao',            'dev-tenant')
ON CONFLICT (name, tenant_id) DO NOTHING;

-- Permissions
INSERT INTO permissions (code, resource, action, description, tenant_id) VALUES
  ('user:read',        'user',       'read',   'Xem nguoi dung',         'dev-tenant'),
  ('user:write',       'user',       'write',  'Tao/sua nguoi dung',     'dev-tenant'),
  ('user:delete',      'user',       'delete', 'Xoa nguoi dung',         'dev-tenant'),
  ('role:read',        'role',       'read',   'Xem role',               'dev-tenant'),
  ('role:write',       'role',       'write',  'Tao/sua role',           'dev-tenant'),
  ('role:delete',      'role',       'delete', 'Xoa role',               'dev-tenant'),
  ('permission:read',  'permission', 'read',   'Xem permission',         'dev-tenant'),
  ('permission:write', 'permission', 'write',  'Tao/sua permission',     'dev-tenant')
ON CONFLICT (code, tenant_id) DO NOTHING;

-- Admin user
-- password_hash = bcrypt('Admin@123456', 12)
INSERT INTO users (username, password_hash, email, full_name, role_id, status, tenant_id)
SELECT
  'admin',
  '$2b$12$qPrnRfCFWMwAyZUpqkyBPeMmuJaenKQOpoUPkl2hODp1dydl80EEe',
  'admin@dev.local',
  'System Administrator',
  r.id,
  'ACTIVE',
  'dev-tenant'
FROM roles r
WHERE r.name = 'ADMIN' AND r.tenant_id = 'dev-tenant'
ON CONFLICT (username, tenant_id) DO NOTHING;
