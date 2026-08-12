CREATE TABLE projects (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  target_end_date TIMESTAMPTZ,
  actual_end_date TIMESTAMPTZ,
  budget_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  CONSTRAINT projects_status_check CHECK (
    status IN ('CREATED', 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'CLOSED')
  ),
  CONSTRAINT projects_type_check CHECK (
    project_type IN ('CLIENT', 'INTERNAL', 'RESEARCH', 'PRODUCT', 'MARKETING', 'OTHER')
  ),
  CONSTRAINT projects_priority_check CHECK (
    priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')
  ),
  CONSTRAINT projects_dates_check CHECK (
    target_end_date IS NULL OR start_date IS NULL OR target_end_date >= start_date
  ),
  CONSTRAINT projects_org_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX projects_organization_idx ON projects(organization_id);
CREATE INDEX projects_status_idx ON projects(status);
CREATE INDEX projects_owner_idx ON projects(owner_id);

CREATE TABLE project_phases (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT project_phases_status_check CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED')),
  CONSTRAINT project_phases_sequence_positive CHECK (sequence >= 1),
  CONSTRAINT project_phases_project_sequence_unique UNIQUE (project_id, sequence)
);

CREATE INDEX project_phases_organization_idx ON project_phases(organization_id);
CREATE INDEX project_phases_project_idx ON project_phases(project_id);
CREATE INDEX project_phases_status_idx ON project_phases(status);
CREATE UNIQUE INDEX project_phases_active_unique ON project_phases(project_id) WHERE status = 'ACTIVE';

CREATE TABLE project_objectives (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  target_value NUMERIC(18, 6) NOT NULL,
  current_value NUMERIC(18, 6) NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT project_objectives_status_check CHECK (
    status IN ('NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'FAILED')
  ),
  CONSTRAINT project_objectives_target_positive CHECK (target_value > 0),
  CONSTRAINT project_objectives_current_nonnegative CHECK (current_value >= 0),
  CONSTRAINT project_objectives_project_name_unique UNIQUE (project_id, name)
);

CREATE INDEX project_objectives_organization_idx ON project_objectives(organization_id);
CREATE INDEX project_objectives_project_idx ON project_objectives(project_id);
CREATE INDEX project_objectives_status_idx ON project_objectives(status);

CREATE TABLE project_dependencies (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  depends_on_project_id UUID NOT NULL REFERENCES projects(id),
  dependency_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT project_dependencies_type_check CHECK (
    dependency_type IN ('BLOCKS', 'RELATES_TO', 'OPTIONAL')
  ),
  CONSTRAINT project_dependencies_status_check CHECK (
    status IN ('ACTIVE', 'RESOLVED', 'CANCELLED')
  ),
  CONSTRAINT project_dependencies_not_self CHECK (project_id <> depends_on_project_id)
);

CREATE INDEX project_dependencies_organization_idx ON project_dependencies(organization_id);
CREATE INDEX project_dependencies_project_idx ON project_dependencies(project_id);
CREATE INDEX project_dependencies_depends_on_idx ON project_dependencies(depends_on_project_id);
CREATE INDEX project_dependencies_status_idx ON project_dependencies(status);

CREATE TABLE deliverables (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  work_order_references UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT deliverables_status_check CHECK (
    status IN ('PLANNED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'APPROVED', 'DELIVERED')
  ),
  CONSTRAINT deliverables_project_name_unique UNIQUE (project_id, name)
);

CREATE INDEX deliverables_organization_idx ON deliverables(organization_id);
CREATE INDEX deliverables_project_idx ON deliverables(project_id);
CREATE INDEX deliverables_status_idx ON deliverables(status);
