CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  contract_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  quotation_id UUID NOT NULL REFERENCES quotes(id),
  status TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  current_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  CONSTRAINT contracts_org_number_unique UNIQUE (organization_id, contract_number),
  CONSTRAINT contracts_effective_expiry_check CHECK (expiry_date IS NULL OR expiry_date > effective_date)
);

CREATE INDEX contracts_organization_idx ON contracts(organization_id);
CREATE INDEX contracts_customer_idx ON contracts(customer_id);
CREATE INDEX contracts_quotation_idx ON contracts(quotation_id);
CREATE INDEX contracts_status_idx ON contracts(status);
CREATE INDEX contracts_current_version_idx ON contracts(current_version_id);

CREATE TABLE contract_versions (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  version_number BIGINT NOT NULL,
  term_ids UUID[] NOT NULL,
  status TEXT NOT NULL,
  locked BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT contract_versions_contract_number_unique UNIQUE (contract_id, version_number)
);

CREATE INDEX contract_versions_contract_idx ON contract_versions(contract_id);
CREATE INDEX contract_versions_organization_idx ON contract_versions(organization_id);
CREATE INDEX contract_versions_status_idx ON contract_versions(status);

ALTER TABLE contracts
  ADD CONSTRAINT contracts_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES contract_versions(id);

CREATE TABLE contract_terms (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  contract_version_id UUID NOT NULL REFERENCES contract_versions(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mandatory BOOLEAN NOT NULL,
  term_order BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT contract_terms_order_positive CHECK (term_order >= 1),
  CONSTRAINT contract_terms_version_order_unique UNIQUE (contract_version_id, term_order)
);

CREATE INDEX contract_terms_version_idx ON contract_terms(contract_version_id);
CREATE INDEX contract_terms_organization_idx ON contract_terms(organization_id);

CREATE TABLE contract_amendments (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  reason TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  resulting_version_id UUID REFERENCES contract_versions(id),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX contract_amendments_contract_idx ON contract_amendments(contract_id);
CREATE INDEX contract_amendments_organization_idx ON contract_amendments(organization_id);
CREATE INDEX contract_amendments_status_idx ON contract_amendments(status);
CREATE INDEX contract_amendments_resulting_version_idx ON contract_amendments(resulting_version_id);
