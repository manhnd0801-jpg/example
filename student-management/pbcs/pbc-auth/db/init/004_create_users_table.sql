-- Migration 004: Create users table
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255),
  role_id       UUID NOT NULL REFERENCES roles(id),
  status        user_status NOT NULL DEFAULT 'ACTIVE',
  attributes    JSONB,
  tenant_id     VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP,
  UNIQUE (username, tenant_id),
  UNIQUE (email, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status, tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
