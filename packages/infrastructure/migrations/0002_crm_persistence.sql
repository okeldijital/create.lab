CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  customer_number text NOT NULL,
  name text NOT NULL,
  legal_name text,
  status text NOT NULL,
  industry text,
  billing_address text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  archived_at timestamptz,
  CONSTRAINT customers_org_number_unique UNIQUE (organization_id, customer_number)
);

CREATE INDEX IF NOT EXISTS customers_organization_idx ON customers (organization_id);
CREATE INDEX IF NOT EXISTS customers_status_idx ON customers (status);

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text,
  is_primary boolean NOT NULL DEFAULT false,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  archived_at timestamptz,
  CONSTRAINT contacts_customer_email_unique UNIQUE (customer_id, email)
);

CREATE INDEX IF NOT EXISTS contacts_customer_idx ON contacts (customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS contacts_one_primary_idx ON contacts (customer_id) WHERE is_primary = true;

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  title text NOT NULL,
  estimated_value_minor integer NOT NULL CHECK (estimated_value_minor >= 0),
  probability integer NOT NULL CHECK (probability BETWEEN 0 AND 100),
  expected_close_date timestamptz,
  project_id uuid,
  status text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  archived_at timestamptz
);

CREATE INDEX IF NOT EXISTS opportunities_customer_idx ON opportunities (customer_id);
CREATE INDEX IF NOT EXISTS opportunities_status_idx ON opportunities (status);

CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  contact_id uuid REFERENCES contacts(id),
  type text NOT NULL,
  summary text NOT NULL,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS interactions_customer_idx ON interactions (customer_id);
CREATE INDEX IF NOT EXISTS interactions_customer_occurred_idx ON interactions (customer_id, occurred_at);
