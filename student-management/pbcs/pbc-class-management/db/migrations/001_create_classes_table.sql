-- AI-GENERATED
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS classes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_code       VARCHAR(20)  NOT NULL,
  class_name       VARCHAR(255) NOT NULL,
  academic_year    VARCHAR(20)  NOT NULL,
  course_id        UUID,
  max_students     INTEGER      NOT NULL DEFAULT 30,
  current_students INTEGER      NOT NULL DEFAULT 0,
  status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','PLANNED')),
  description      TEXT,
  tenant_id        VARCHAR(100) NOT NULL,
  attributes       JSONB        NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (class_code, tenant_id)
);

CREATE TABLE IF NOT EXISTS class_students (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id      UUID         NOT NULL REFERENCES classes(id),
  student_id    UUID         NOT NULL,
  assigned_date DATE,
  removed_date  DATE,
  status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  tenant_id     VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classes_tenant_id       ON classes(tenant_id);
CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student  ON class_students(student_id);
