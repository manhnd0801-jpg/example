-- AI-GENERATED
DO $$
DECLARE v_schema TEXT := 'tenant_' || replace(:'tenant_id', '-', '_');
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema);
  RAISE NOTICE 'Schema % ready', v_schema;
END $$;
