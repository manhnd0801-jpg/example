-- AI-GENERATED
-- Tenant initialization script cho pbc-course-management
-- Chạy script này khi onboard tenant mới
-- Usage: psql -v tenant_id='tenant-xxx' -f tenant-init.sql

DO $
DECLARE
  v_tenant_id TEXT := :'tenant_id';
BEGIN
  IF v_tenant_id IS NULL OR v_tenant_id = '' THEN
    RAISE EXCEPTION 'tenant_id must be provided. Usage: psql -v tenant_id=''your-tenant-id'' -f tenant-init.sql';
  END IF;

  -- Không cần seed dữ liệu mặc định cho course — khóa học được tạo thủ công
  RAISE NOTICE 'pbc-course-management: tenant % initialized successfully', v_tenant_id;
END $;
