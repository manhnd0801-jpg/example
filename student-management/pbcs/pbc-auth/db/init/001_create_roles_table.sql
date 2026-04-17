-- Migration 001: Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  tenant_id   VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (name, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);
