CREATE TABLE IF NOT EXISTS availability_profiles (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  timezone text NOT NULL,
  working_days jsonb NOT NULL,
  working_hours_start text NOT NULL,
  working_hours_end text NOT NULL,
  exceptions jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT availability_profiles_org_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX IF NOT EXISTS availability_profiles_organization_idx ON availability_profiles (organization_id);

CREATE TABLE IF NOT EXISTS working_patterns (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  hours_per_week numeric(8,2) NOT NULL CHECK (hours_per_week > 0),
  hours_per_day numeric(8,2) NOT NULL CHECK (hours_per_day > 0),
  days_per_week integer NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
  overtime_allowed boolean NOT NULL,
  remote_allowed boolean NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS working_patterns_organization_idx ON working_patterns (organization_id);

CREATE TABLE IF NOT EXISTS capacity_profiles (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  resource_id uuid NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('WORKER', 'STUDIO')),
  availability_profile_id uuid REFERENCES availability_profiles(id),
  working_pattern_id uuid REFERENCES working_patterns(id),
  status text NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT capacity_profiles_effective_range_check CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS capacity_profiles_organization_idx ON capacity_profiles (organization_id);
CREATE INDEX IF NOT EXISTS capacity_profiles_resource_idx ON capacity_profiles (resource_id);
CREATE INDEX IF NOT EXISTS capacity_profiles_status_idx ON capacity_profiles (status);
CREATE UNIQUE INDEX IF NOT EXISTS capacity_profiles_active_resource_unique ON capacity_profiles (resource_id) WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS capabilities (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  capacity_profile_id uuid NOT NULL REFERENCES capacity_profiles(id),
  name text NOT NULL,
  proficiency text NOT NULL CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
  certification text,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  active boolean NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT capabilities_effective_range_check CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS capabilities_organization_idx ON capabilities (organization_id);
CREATE INDEX IF NOT EXISTS capabilities_profile_idx ON capabilities (capacity_profile_id);
CREATE UNIQUE INDEX IF NOT EXISTS capabilities_active_profile_name_unique ON capabilities (capacity_profile_id, name) WHERE active = true;

CREATE TABLE IF NOT EXISTS resource_capacities (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  capacity_profile_id uuid NOT NULL REFERENCES capacity_profiles(id),
  capacity_type text NOT NULL,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL CHECK (unit IN ('HOURS', 'SESSIONS', 'TASKS', 'UNITS')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT resource_capacities_effective_range_check CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS resource_capacities_organization_idx ON resource_capacities (organization_id);
CREATE INDEX IF NOT EXISTS resource_capacities_profile_idx ON resource_capacities (capacity_profile_id);
