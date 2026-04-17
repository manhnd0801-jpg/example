-- Migration 002: Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(100) NOT NULL,
  resource    VARCHAR(100) NOT NULL,
  action      VARCHAR(100) NOT NULL,
  description TEXT,
  tenant_id   VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (code, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_permissions_tenant_id ON permissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource, tenant_id);
