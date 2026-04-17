-- AI-GENERATED
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS subjects (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_code     VARCHAR(20)  NOT NULL,
  subject_name     VARCHAR(255) NOT NULL,
  description      TEXT,
  theory_credits   INTEGER      NOT NULL DEFAULT 2,
  practice_credits INTEGER      NOT NULL DEFAULT 1,
  total_credits    INTEGER      NOT NULL DEFAULT 3,
  subject_type     VARCHAR(20)  NOT NULL DEFAULT 'REQUIRED' CHECK (subject_type IN ('REQUIRED','ELECTIVE','FREE_ELECTIVE')),
  tenant_id        VARCHAR(100) NOT NULL,
  attributes       JSONB        NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (subject_code, tenant_id)
);

CREATE TABLE IF NOT EXISTS subject_classes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id  UUID         NOT NULL REFERENCES subjects(id),
  class_id    UUID         NOT NULL,
  semester    INTEGER      NOT NULL DEFAULT 1,
  teacher_id  UUID,
  schedule    VARCHAR(255),
  room        VARCHAR(100),
  status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  tenant_id   VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, class_id, tenant_id)
);

CREATE INDEX idx_subjects_tenant_id        ON subjects(tenant_id);
CREATE INDEX idx_subject_classes_subject   ON subject_classes(subject_id);
CREATE INDEX idx_subject_classes_class     ON subject_classes(class_id);
