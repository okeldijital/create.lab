CREATE TABLE work_orders (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  allocation_id UUID NOT NULL,
  booking_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  planned_start TIMESTAMPTZ NOT NULL,
  planned_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  CONSTRAINT work_orders_status_check CHECK (
    status IN ('CREATED', 'READY', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'CLOSED')
  ),
  CONSTRAINT work_orders_priority_check CHECK (
    priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')
  ),
  CONSTRAINT work_orders_planned_range_check CHECK (planned_end >= planned_start)
);

CREATE INDEX work_orders_organization_idx ON work_orders(organization_id);
CREATE INDEX work_orders_allocation_idx ON work_orders(allocation_id);
CREATE INDEX work_orders_booking_idx ON work_orders(booking_id);
CREATE INDEX work_orders_status_idx ON work_orders(status);

CREATE TABLE work_sessions (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL,
  duration_ms BIGINT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT work_sessions_status_check CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED')),
  CONSTRAINT work_sessions_range_check CHECK (ended_at IS NULL OR ended_at >= started_at),
  CONSTRAINT work_sessions_duration_nonnegative CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

CREATE INDEX work_sessions_organization_idx ON work_sessions(organization_id);
CREATE INDEX work_sessions_work_order_idx ON work_sessions(work_order_id);
CREATE INDEX work_sessions_status_idx ON work_sessions(status);

CREATE TABLE work_milestones (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX work_milestones_organization_idx ON work_milestones(organization_id);
CREATE INDEX work_milestones_work_order_idx ON work_milestones(work_order_id);
CREATE INDEX work_milestones_completed_idx ON work_milestones(completed);

CREATE TABLE work_outputs (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  name TEXT NOT NULL,
  output_type TEXT NOT NULL,
  version INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT work_outputs_type_check CHECK (
    output_type IN ('AUDIO', 'VIDEO', 'IMAGE', 'DOCUMENT', 'OTHER')
  ),
  CONSTRAINT work_outputs_status_check CHECK (
    status IN ('DRAFT', 'REVIEW', 'APPROVED', 'DELIVERED', 'ARCHIVED')
  ),
  CONSTRAINT work_outputs_version_positive CHECK (version >= 1),
  CONSTRAINT work_outputs_order_name_version_unique UNIQUE (work_order_id, name, version)
);

CREATE INDEX work_outputs_organization_idx ON work_outputs(organization_id);
CREATE INDEX work_outputs_work_order_idx ON work_outputs(work_order_id);
CREATE INDEX work_outputs_status_idx ON work_outputs(status);

CREATE TABLE work_incidents (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL,
  resolved BOOLEAN NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT work_incidents_type_check CHECK (
    incident_type IN ('TECHNICAL', 'RESOURCE', 'CLIENT', 'ENVIRONMENT', 'OTHER')
  ),
  CONSTRAINT work_incidents_severity_check CHECK (
    severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
  )
);

CREATE INDEX work_incidents_organization_idx ON work_incidents(organization_id);
CREATE INDEX work_incidents_work_order_idx ON work_incidents(work_order_id);
CREATE INDEX work_incidents_resolved_idx ON work_incidents(resolved);
