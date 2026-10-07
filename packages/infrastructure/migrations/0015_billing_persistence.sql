CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  delivery_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  invoice_number TEXT NOT NULL,
  issue_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  currency TEXT NOT NULL,
  subtotal_minor BIGINT NOT NULL,
  tax_minor BIGINT NOT NULL,
  discount_minor BIGINT NOT NULL,
  total_minor BIGINT NOT NULL,
  balance_minor BIGINT NOT NULL,
  paid_minor BIGINT NOT NULL,
  credited_minor BIGINT NOT NULL,
  line_ids UUID[] NOT NULL,
  status TEXT NOT NULL,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT invoices_status_check CHECK (
    status IN ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOID', 'ARCHIVED')
  ),
  CONSTRAINT invoices_org_number_unique UNIQUE (organization_id, invoice_number)
);

CREATE INDEX invoices_organization_idx ON invoices(organization_id);
CREATE INDEX invoices_project_idx ON invoices(project_id);
CREATE INDEX invoices_delivery_idx ON invoices(delivery_id);
CREATE INDEX invoices_customer_idx ON invoices(customer_id);
CREATE INDEX invoices_status_idx ON invoices(status);

CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  description TEXT NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit_price_minor BIGINT NOT NULL,
  discount_minor BIGINT NOT NULL,
  tax_rate DOUBLE PRECISION NOT NULL,
  line_total_minor BIGINT NOT NULL,
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX invoice_lines_organization_idx ON invoice_lines(organization_id);
CREATE INDEX invoice_lines_invoice_idx ON invoice_lines(invoice_id);
