-- AI-GENERATED
-- Tenant initialization for pbc-student-management
-- Usage: psql -v tenant_id='tenant-xxx' -f tenant-init.sql

DO $$
DECLARE
  v_tenant_id TEXT := :'tenant_id';
  v_schema TEXT := 'tenant_' || replace(:'tenant_id', '-', '_');
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema);
  RAISE NOTICE 'Schema % ready for tenant %', v_schema, v_tenant_id;
END $$;
