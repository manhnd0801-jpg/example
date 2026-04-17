-- AI-GENERATED
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS courses (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code    VARCHAR(20)  NOT NULL,
  course_name    VARCHAR(255) NOT NULL,
  description    TEXT,
  duration_years INTEGER      NOT NULL DEFAULT 4,
  total_credits  INTEGER      NOT NULL DEFAULT 0,
  status         VARCHAR(20)  NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('ACTIVE','CLOSED','UPCOMING')),
  tenant_id      VARCHAR(100) NOT NULL,
  attributes     JSONB        NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (course_code, tenant_id)
);

CREATE TABLE IF NOT EXISTS course_subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  subject_id  UUID         NOT NULL,
  semester    INTEGER      NOT NULL DEFAULT 1,
  is_required BOOLEAN      NOT NULL DEFAULT true,
  order_index INTEGER      NOT NULL DEFAULT 0,
  tenant_id   VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, subject_id, tenant_id)
);

CREATE INDEX idx_courses_tenant_id         ON courses(tenant_id);
CREATE INDEX idx_course_subjects_course_id ON course_subjects(course_id);
