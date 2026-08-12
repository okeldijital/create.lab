CREATE TABLE capacity_profiles (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  resource_id UUID NOT NULL,
  resource_type TEXT NOT NULL,
  availability_profile_id UUID,
  working_pattern_id UUID,
  status TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT capacity_profiles_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from),
  CONSTRAINT capacity_profiles_resource_type CHECK (resource_type IN ('WORKER', 'STUDIO'))
);

CREATE INDEX capacity_profiles_organization_idx ON capacity_profiles(organization_id);
CREATE INDEX capacity_profiles_resource_idx ON capacity_profiles(resource_id);
CREATE INDEX capacity_profiles_status_idx ON capacity_profiles(status);
CREATE UNIQUE INDEX capacity_profiles_active_resource_unique
  ON capacity_profiles(resource_id)
  WHERE status = 'ACTIVE';

CREATE TABLE availability_profiles (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  working_days JSONB NOT NULL,
  working_hours_start TEXT NOT NULL,
  working_hours_end TEXT NOT NULL,
  exceptions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT availability_profiles_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX availability_profiles_organization_idx ON availability_profiles(organization_id);

CREATE TABLE working_patterns (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  hours_per_week NUMERIC(8,3) NOT NULL,
  hours_per_day NUMERIC(8,3) NOT NULL,
  days_per_week INTEGER NOT NULL,
  overtime_allowed BOOLEAN NOT NULL,
  remote_allowed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT working_patterns_days_per_week CHECK (days_per_week BETWEEN 1 AND 7),
  CONSTRAINT working_patterns_hours_positive CHECK (hours_per_week >= 0 AND hours_per_day > 0),
  CONSTRAINT working_patterns_hours_consistent CHECK (hours_per_week <= days_per_week * hours_per_day + 0.001)
);

CREATE INDEX working_patterns_organization_idx ON working_patterns(organization_id);

CREATE TABLE capabilities (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  capacity_profile_id UUID NOT NULL REFERENCES capacity_profiles(id),
  name TEXT NOT NULL,
  proficiency TEXT NOT NULL,
  certification TEXT,
  effective_from DATE NOT NULL,
  effective_to DATE,
  active BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT capabilities_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from),
  CONSTRAINT capabilities_proficiency CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'))
);

CREATE INDEX capabilities_organization_idx ON capabilities(organization_id);
CREATE INDEX capabilities_profile_idx ON capabilities(capacity_profile_id);
CREATE INDEX capabilities_active_idx ON capabilities(active);
CREATE UNIQUE INDEX capabilities_active_profile_name_unique
  ON capabilities(capacity_profile_id, name)
  WHERE active = TRUE;

CREATE TABLE resource_capacities (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  capacity_profile_id UUID NOT NULL REFERENCES capacity_profiles(id),
  capacity_type TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT resource_capacities_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from),
  CONSTRAINT resource_capacities_quantity_nonnegative CHECK (quantity >= 0),
  CONSTRAINT resource_capacities_unit CHECK (unit IN ('HOURS', 'SESSIONS', 'TASKS', 'UNITS'))
);

CREATE INDEX resource_capacities_organization_idx ON resource_capacities(organization_id);
CREATE INDEX resource_capacities_profile_idx ON resource_capacities(capacity_profile_id);
CREATE INDEX resource_capacities_effective_idx ON resource_capacities(effective_from, effective_to);
