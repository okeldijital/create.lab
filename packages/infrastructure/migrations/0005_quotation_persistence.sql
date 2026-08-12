CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  quote_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  opportunity_id UUID REFERENCES opportunities(id),
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  current_version_id UUID,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  CONSTRAINT quotes_org_number_unique UNIQUE (organization_id, quote_number)
);

CREATE INDEX quotes_organization_idx ON quotes(organization_id);
CREATE INDEX quotes_customer_idx ON quotes(customer_id);
CREATE INDEX quotes_opportunity_idx ON quotes(opportunity_id);
CREATE INDEX quotes_status_idx ON quotes(status);
CREATE INDEX quotes_current_version_idx ON quotes(current_version_id);

CREATE TABLE quote_versions (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  version_number BIGINT NOT NULL,
  line_ids UUID[] NOT NULL DEFAULT '{}',
  subtotal_minor BIGINT NOT NULL,
  discount_minor BIGINT NOT NULL,
  total_minor BIGINT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  locked BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT quote_versions_quote_number_unique UNIQUE (quote_id, version_number),
  CONSTRAINT quote_versions_positive_number_check CHECK (version_number >= 1),
  CONSTRAINT quote_versions_nonnegative_amounts_check CHECK (subtotal_minor >= 0 AND discount_minor >= 0 AND total_minor >= 0)
);

CREATE INDEX quote_versions_quote_idx ON quote_versions(quote_id);
CREATE INDEX quote_versions_organization_idx ON quote_versions(organization_id);
CREATE INDEX quote_versions_status_idx ON quote_versions(status);
CREATE UNIQUE INDEX quote_versions_current_unique ON quote_versions(quote_id) WHERE status = 'CURRENT';

ALTER TABLE quotes
  ADD CONSTRAINT quotes_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES quote_versions(id);

CREATE TABLE quote_lines (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  quote_version_id UUID NOT NULL REFERENCES quote_versions(id),
  service_id UUID NOT NULL REFERENCES services(id),
  description TEXT NOT NULL,
  quantity BIGINT NOT NULL,
  unit_price_minor BIGINT NOT NULL,
  line_total_minor BIGINT NOT NULL,
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT quote_lines_quantity_positive_check CHECK (quantity > 0),
  CONSTRAINT quote_lines_unit_price_nonnegative_check CHECK (unit_price_minor >= 0),
  CONSTRAINT quote_lines_total_nonnegative_check CHECK (line_total_minor >= 0)
);

CREATE INDEX quote_lines_version_idx ON quote_lines(quote_version_id);
CREATE INDEX quote_lines_organization_idx ON quote_lines(organization_id);
CREATE INDEX quote_lines_service_idx ON quote_lines(service_id);

CREATE TABLE quote_approvals (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  decision TEXT NOT NULL,
  decision_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX quote_approvals_quote_idx ON quote_approvals(quote_id);
CREATE INDEX quote_approvals_organization_idx ON quote_approvals(organization_id);
CREATE INDEX quote_approvals_decision_idx ON quote_approvals(decision);
