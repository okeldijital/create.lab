CREATE TABLE deliveries (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  production_id UUID NOT NULL,
  review_id UUID NOT NULL,
  package_id UUID,
  reference_number TEXT NOT NULL,
  status TEXT NOT NULL,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT deliveries_status_check CHECK (
    status IN ('DRAFT', 'READY', 'DELIVERED', 'CONFIRMED', 'ARCHIVED')
  ),
  CONSTRAINT deliveries_reference_unique UNIQUE (reference_number)
);

CREATE INDEX deliveries_organization_idx ON deliveries(organization_id);
CREATE INDEX deliveries_project_idx ON deliveries(project_id);
CREATE INDEX deliveries_production_idx ON deliveries(production_id);
CREATE INDEX deliveries_review_idx ON deliveries(review_id);
CREATE INDEX deliveries_package_idx ON deliveries(package_id);
CREATE INDEX deliveries_status_idx ON deliveries(status);
