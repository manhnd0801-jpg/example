-- AI-GENERATED
-- Seed: Tạo admin user mặc định cho môi trường dev/local
-- Chạy sau khi migrations đã xong
-- Usage: docker exec <db-container> psql -U postgres -d pbc_auth -f /seed/admin-user.sql
--
-- Tài khoản mặc định:
--   username: admin
--   password: Admin@123456
--   role: ADMIN
--   tenant: dev-tenant
--
-- ⚠️  ĐỔI MẬT KHẨU NGAY SAU KHI ĐĂNG NHẬP LẦN ĐẦU

DO $$
DECLARE
  v_tenant_id TEXT := 'dev-tenant';
  v_role_id   UUID;
  -- bcrypt hash của 'Admin@123456' với salt rounds=12
  -- Verify: node -e "require('bcrypt').compare('Admin@123456','<hash>').then(console.log)"
  v_password_hash TEXT := '$2b$12$qPrnRfCFWMwAyZUpqkyBPeMmuJaenKQOpoUPkl2hODp1dydl80EEe';
BEGIN
  -- 1. Tạo roles
  INSERT INTO roles (name, description, tenant_id) VALUES
    ('ADMIN',          'Quản trị toàn hệ thống', v_tenant_id),
    ('TEACHER',        'Giảng viên',              v_tenant_id),
    ('STUDENT',        'Sinh viên',               v_tenant_id),
    ('ACADEMIC_STAFF', 'Ban đào tạo',             v_tenant_id)
  ON CONFLICT (name, tenant_id) DO NOTHING;

  -- 2. Tạo permissions
  INSERT INTO permissions (code, resource, action, description, tenant_id) VALUES
    ('user:read',        'user',       'read',   'Xem người dùng',         v_tenant_id),
    ('user:write',       'user',       'write',  'Tạo/sửa người dùng',     v_tenant_id),
    ('user:delete',      'user',       'delete', 'Xóa người dùng',         v_tenant_id),
    ('role:read',        'role',       'read',   'Xem role',               v_tenant_id),
    ('role:write',       'role',       'write',  'Tạo/sửa role',           v_tenant_id),
    ('role:delete',      'role',       'delete', 'Xóa role',               v_tenant_id),
    ('permission:read',  'permission', 'read',   'Xem permission',         v_tenant_id),
    ('permission:write', 'permission', 'write',  'Tạo/sửa permission',     v_tenant_id)
  ON CONFLICT (code, tenant_id) DO NOTHING;

  -- 3. Lấy role_id của ADMIN
  SELECT id INTO v_role_id FROM roles WHERE name = 'ADMIN' AND tenant_id = v_tenant_id;

  -- 4. Tạo admin user
  INSERT INTO users (username, password_hash, email, full_name, role_id, status, tenant_id)
  VALUES (
    'admin',
    v_password_hash,
    'admin@dev.local',
    'System Administrator',
    v_role_id,
    'ACTIVE',
    v_tenant_id
  )
  ON CONFLICT (username, tenant_id) DO NOTHING;

  RAISE NOTICE '✅ Seed completed for tenant: %', v_tenant_id;
  RAISE NOTICE '   Login: admin / Admin@123456';
  RAISE NOTICE '   ⚠️  Change password after first login!';
END $$;
