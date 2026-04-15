-- AI-GENERATED
-- Seed: Default permissions
-- Usage: SET app.tenant_id = 'your-tenant-id'; \i permissions.sql
-- Hoặc chạy qua tenant-init.sql để tự động seed cùng lúc khởi tạo tenant

DO $$
DECLARE
  v_tenant_id TEXT := current_setting('app.tenant_id', true);
BEGIN
  IF v_tenant_id IS NULL OR v_tenant_id = '' THEN
    RAISE EXCEPTION 'app.tenant_id must be set before running seed. Example: SET app.tenant_id = ''your-tenant-id'';';
  END IF;

  INSERT INTO permissions (code, resource, action, description, tenant_id) VALUES
    ('user:read',        'user',       'read',   'Xem danh sách/chi tiết người dùng', v_tenant_id),
    ('user:write',       'user',       'write',  'Tạo/sửa người dùng',               v_tenant_id),
    ('user:delete',      'user',       'delete', 'Xóa người dùng',                   v_tenant_id),
    ('role:read',        'role',       'read',   'Xem danh sách/chi tiết role',       v_tenant_id),
    ('role:write',       'role',       'write',  'Tạo/sửa role',                     v_tenant_id),
    ('role:delete',      'role',       'delete', 'Xóa role',                         v_tenant_id),
    ('permission:read',  'permission', 'read',   'Xem danh sách/chi tiết permission', v_tenant_id),
    ('permission:write', 'permission', 'write',  'Tạo/sửa permission',               v_tenant_id)
  ON CONFLICT (code, tenant_id) DO NOTHING;

  RAISE NOTICE 'Seeded permissions for tenant: %', v_tenant_id;
END $$;
