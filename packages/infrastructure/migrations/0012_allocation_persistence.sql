CREATE TABLE allocations (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL,
  work_order_id UUID NOT NULL,
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  status TEXT NOT NULL,
  allocation_percentage INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT allocations_status_check CHECK (
    status IN ('PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'ARCHIVED')
  ),
  CONSTRAINT allocations_resource_type_check CHECK (
    resource_type IN ('WORKER', 'TEAM', 'STUDIO', 'EQUIPMENT')
  ),
  CONSTRAINT allocations_priority_check CHECK (
    priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')
  ),
  CONSTRAINT allocations_percentage_check CHECK (
    allocation_percentage >= 1 AND allocation_percentage <= 100
  ),
  CONSTRAINT allocations_date_range_check CHECK (end_date > start_date)
);

CREATE INDEX allocations_organization_idx ON allocations(organization_id);
CREATE INDEX allocations_project_idx ON allocations(project_id);
CREATE INDEX allocations_work_order_idx ON allocations(work_order_id);
CREATE INDEX allocations_resource_idx ON allocations(resource_id);
CREATE INDEX allocations_status_idx ON allocations(status);
CREATE INDEX allocations_period_idx ON allocations(start_date, end_date);

CREATE TABLE allocation_groups (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  allocation_ids UUID[] NOT NULL,
  archived BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT allocation_groups_org_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX allocation_groups_organization_idx ON allocation_groups(organization_id);
CREATE INDEX allocation_groups_archived_idx ON allocation_groups(archived);

CREATE TABLE reservations (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  resource_id TEXT NOT NULL,
  project_id UUID NOT NULL,
  requested_by TEXT NOT NULL,
  reserved_from TIMESTAMPTZ NOT NULL,
  reserved_until TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  converted_allocation_id UUID REFERENCES allocations(id),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT reservations_status_check CHECK (
    status IN ('REQUESTED', 'APPROVED', 'CONVERTED', 'CANCELLED')
  ),
  CONSTRAINT reservations_period_check CHECK (reserved_until > reserved_from)
);

CREATE INDEX reservations_organization_idx ON reservations(organization_id);
CREATE INDEX reservations_resource_idx ON reservations(resource_id);
CREATE INDEX reservations_project_idx ON reservations(project_id);
CREATE INDEX reservations_status_idx ON reservations(status);
CREATE INDEX reservations_converted_allocation_idx ON reservations(converted_allocation_id);
