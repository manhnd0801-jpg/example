-- AI-GENERATED
-- Seed: Default roles
-- Usage: psql -v tenant_id='<your-tenant-id>' -f roles.sql
-- Hoặc chạy qua tenant-init.sql để tự động seed cùng lúc khởi tạo tenant

DO $$
DECLARE
  v_tenant_id TEXT := current_setting('app.tenant_id', true);
BEGIN
  IF v_tenant_id IS NULL OR v_tenant_id = '' THEN
    RAISE EXCEPTION 'app.tenant_id must be set before running seed. Example: SET app.tenant_id = ''your-tenant-id'';';
  END IF;

  INSERT INTO roles (name, description, tenant_id) VALUES
    ('ADMIN',          'Quản trị toàn hệ thống', v_tenant_id),
    ('TEACHER',        'Giảng viên',              v_tenant_id),
    ('STUDENT',        'Sinh viên',               v_tenant_id),
    ('ACADEMIC_STAFF', 'Ban đào tạo',             v_tenant_id)
  ON CONFLICT (name, tenant_id) DO NOTHING;

  RAISE NOTICE 'Seeded roles for tenant: %', v_tenant_id;
END $$;
