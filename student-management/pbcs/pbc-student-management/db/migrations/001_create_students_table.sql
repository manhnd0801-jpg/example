-- AI-GENERATED
-- Migration: Create students table

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_code    VARCHAR(20)  NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  date_of_birth   DATE,
  gender          VARCHAR(10)  CHECK (gender IN ('MALE','FEMALE','OTHER')),
  address         TEXT,
  phone           VARCHAR(20),
  email           VARCHAR(255),
  status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE','SUSPENDED','GRADUATED','DROPPED_OUT')),
  class_id        UUID,
  enrollment_date DATE,
  graduation_date DATE,
  tenant_id       VARCHAR(100) NOT NULL,
  attributes      JSONB        NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (student_code, tenant_id)
);

CREATE INDEX idx_students_tenant_id   ON students(tenant_id);
CREATE INDEX idx_students_status      ON students(status);
CREATE INDEX idx_students_class_id    ON students(class_id);
CREATE INDEX idx_students_deleted_at  ON students(deleted_at);
