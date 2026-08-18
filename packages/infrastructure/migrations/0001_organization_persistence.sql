CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  display_name text NOT NULL,
  legal_name text NOT NULL,
  slug text NOT NULL,
  description text,
  timezone text NOT NULL,
  locale text NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  archived_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_unique ON organizations (slug);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  description text,
  parent_department_id uuid REFERENCES departments(id),
  head_id uuid,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT departments_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  department_id uuid NOT NULL REFERENCES departments(id),
  name text NOT NULL,
  description text,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT teams_department_name_unique UNIQUE (department_id, name)
);

CREATE TABLE IF NOT EXISTS studios (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  description text,
  type text NOT NULL,
  capacity integer NOT NULL CHECK (capacity >= 0),
  location text,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT studios_org_name_unique UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS organization_settings (
  organization_id uuid PRIMARY KEY REFERENCES organizations(id),
  timezone text NOT NULL,
  locale text NOT NULL,
  currency text NOT NULL,
  working_week text[] NOT NULL,
  working_hours jsonb NOT NULL,
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  policies jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL
);
