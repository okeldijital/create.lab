CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  title text NOT NULL,
  description text,
  grade text,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS positions_organization_idx ON positions (organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS positions_org_title_unique ON positions (organization_id, title);
CREATE INDEX IF NOT EXISTS positions_status_idx ON positions (status);

CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  employee_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  preferred_name text,
  email text NOT NULL,
  phone text,
  status text NOT NULL,
  employment_type text NOT NULL,
  position_id uuid REFERENCES positions(id),
  department_id uuid NOT NULL REFERENCES departments(id),
  team_id uuid REFERENCES teams(id),
  manager_id uuid REFERENCES workers(id),
  date_joined timestamptz NOT NULL,
  date_left timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  archived_at timestamptz,
  CONSTRAINT workers_org_employee_number_unique UNIQUE (organization_id, employee_number),
  CONSTRAINT workers_org_email_unique UNIQUE (organization_id, email)
);

CREATE INDEX IF NOT EXISTS workers_organization_idx ON workers (organization_id);
CREATE INDEX IF NOT EXISTS workers_department_idx ON workers (department_id);
CREATE INDEX IF NOT EXISTS workers_team_idx ON workers (team_id);
CREATE INDEX IF NOT EXISTS workers_position_idx ON workers (position_id);
CREATE INDEX IF NOT EXISTS workers_manager_idx ON workers (manager_id);
CREATE INDEX IF NOT EXISTS workers_status_idx ON workers (status);

CREATE TABLE IF NOT EXISTS employments (
  id uuid PRIMARY KEY,
  worker_id uuid NOT NULL REFERENCES workers(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  employment_type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text NOT NULL,
  working_hours_per_week integer NOT NULL CHECK (working_hours_per_week > 0),
  probation_days integer NOT NULL CHECK (probation_days >= 0),
  probation_active boolean NOT NULL,
  notice_period_days integer NOT NULL CHECK (notice_period_days >= 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT employments_period_valid CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS employments_organization_idx ON employments (organization_id);
CREATE INDEX IF NOT EXISTS employments_worker_idx ON employments (worker_id);
CREATE INDEX IF NOT EXISTS employments_status_idx ON employments (status);
CREATE UNIQUE INDEX IF NOT EXISTS employments_active_worker_unique
  ON employments (worker_id)
  WHERE status IN ('PROBATION', 'ACTIVE');

CREATE TABLE IF NOT EXISTS employment_contracts (
  id uuid PRIMARY KEY,
  employment_id uuid NOT NULL REFERENCES employments(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  contract_type text NOT NULL,
  effective_date timestamptz NOT NULL,
  expiry_date timestamptz,
  notice_period_days integer NOT NULL CHECK (notice_period_days >= 0),
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT employment_contracts_period_valid CHECK (expiry_date IS NULL OR expiry_date > effective_date)
);

CREATE INDEX IF NOT EXISTS employment_contracts_organization_idx ON employment_contracts (organization_id);
CREATE INDEX IF NOT EXISTS employment_contracts_employment_idx ON employment_contracts (employment_id);
CREATE INDEX IF NOT EXISTS employment_contracts_status_idx ON employment_contracts (status);
CREATE UNIQUE INDEX IF NOT EXISTS employment_contracts_active_employment_unique
  ON employment_contracts (employment_id)
  WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS reporting_relationships (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  worker_id uuid NOT NULL REFERENCES workers(id),
  manager_id uuid NOT NULL REFERENCES workers(id),
  effective_date timestamptz NOT NULL,
  end_date timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT reporting_relationships_not_self CHECK (worker_id <> manager_id),
  CONSTRAINT reporting_relationships_period_valid CHECK (end_date IS NULL OR end_date >= effective_date)
);

CREATE INDEX IF NOT EXISTS reporting_relationships_organization_idx ON reporting_relationships (organization_id);
CREATE INDEX IF NOT EXISTS reporting_relationships_manager_idx ON reporting_relationships (manager_id);
CREATE INDEX IF NOT EXISTS reporting_relationships_worker_idx ON reporting_relationships (worker_id);
CREATE UNIQUE INDEX IF NOT EXISTS reporting_relationships_active_worker_unique
  ON reporting_relationships (worker_id)
  WHERE end_date IS NULL;
