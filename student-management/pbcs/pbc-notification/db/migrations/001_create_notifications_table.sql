-- AI-GENERATED
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         NOT NULL,
  title       VARCHAR(255) NOT NULL,
  content     TEXT         NOT NULL,
  type        VARCHAR(50)  NOT NULL,
  is_read     BOOLEAN      NOT NULL DEFAULT false,
  read_at     TIMESTAMPTZ,
  metadata    JSONB        NOT NULL DEFAULT '{}',
  tenant_id   VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type   VARCHAR(255) NOT NULL,
  aggregate_id VARCHAR(255),
  description  TEXT,
  user_id      UUID,
  event_data   JSONB        NOT NULL DEFAULT '{}',
  occurred_at  TIMESTAMPTZ  NOT NULL,
  tenant_id    VARCHAR(100) NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id   ON notifications(user_id);
CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_is_read   ON notifications(is_read);
CREATE INDEX idx_audit_logs_event_type   ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_tenant_id    ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_occurred_at  ON audit_logs(occurred_at);
