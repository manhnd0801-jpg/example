-- AI-GENERATED
-- Tenant initialization script
-- Chạy script này khi onboard tenant mới
-- Usage: psql -v tenant_id='tenant-xxx' -f tenant-init.sql

DO $$
DECLARE
  v_tenant_id TEXT := :'tenant_id';
BEGIN
  -- Insert default roles for new tenant
  INSERT INTO roles (name, description, tenant_id) VALUES
    ('ADMIN',          'Quản trị toàn hệ thống', v_tenant_id),
    ('TEACHER',        'Giảng viên',              v_tenant_id),
    ('STUDENT',        'Sinh viên',               v_tenant_id),
    ('ACADEMIC_STAFF', 'Ban đào tạo',             v_tenant_id)
  ON CONFLICT (name, tenant_id) DO NOTHING;

  -- Insert default permissions for new tenant
  INSERT INTO permissions (code, resource, action, description, tenant_id) VALUES
    ('user:read',        'user',       'read',   'Xem người dùng',   v_tenant_id),
    ('user:write',       'user',       'write',  'Tạo/sửa người dùng', v_tenant_id),
    ('user:delete',      'user',       'delete', 'Xóa người dùng',   v_tenant_id),
    ('role:read',        'role',       'read',   'Xem role',         v_tenant_id),
    ('role:write',       'role',       'write',  'Tạo/sửa role',     v_tenant_id),
    ('permission:read',  'permission', 'read',   'Xem permission',   v_tenant_id),
    ('permission:write', 'permission', 'write',  'Tạo/sửa permission', v_tenant_id)
  ON CONFLICT (code, tenant_id) DO NOTHING;

  RAISE NOTICE 'Tenant % initialized successfully', v_tenant_id;
END $$;
