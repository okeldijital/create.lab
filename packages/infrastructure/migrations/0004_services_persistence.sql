CREATE TABLE service_categories (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  CONSTRAINT service_categories_org_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX service_categories_organization_idx ON service_categories(organization_id);
CREATE INDEX service_categories_status_idx ON service_categories(status);

CREATE TABLE services (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  service_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES service_categories(id),
  default_price_book_id UUID,
  pricing_model TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  CONSTRAINT services_org_code_unique UNIQUE (organization_id, service_code)
);

CREATE INDEX services_organization_idx ON services(organization_id);
CREATE INDEX services_category_idx ON services(category_id);
CREATE INDEX services_status_idx ON services(status);

CREATE TABLE price_books (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  currency TEXT NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  CONSTRAINT price_books_effective_period_check CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX price_books_organization_idx ON price_books(organization_id);
CREATE INDEX price_books_status_idx ON price_books(status);
CREATE INDEX price_books_currency_idx ON price_books(organization_id, currency);
CREATE UNIQUE INDEX price_books_published_currency_unique ON price_books(organization_id, currency) WHERE status = 'PUBLISHED';

ALTER TABLE services
  ADD CONSTRAINT services_default_price_book_fk
  FOREIGN KEY (default_price_book_id) REFERENCES price_books(id);

CREATE TABLE price_rules (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  price_book_id UUID NOT NULL REFERENCES price_books(id),
  service_id UUID NOT NULL REFERENCES services(id),
  base_price_minor BIGINT NOT NULL,
  minimum_price_minor BIGINT NOT NULL,
  maximum_price_minor BIGINT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  CONSTRAINT price_rules_nonnegative_check CHECK (minimum_price_minor >= 0 AND base_price_minor >= 0 AND maximum_price_minor >= 0),
  CONSTRAINT price_rules_range_check CHECK (minimum_price_minor <= base_price_minor AND base_price_minor <= maximum_price_minor)
);

CREATE INDEX price_rules_organization_idx ON price_rules(organization_id);
CREATE INDEX price_rules_price_book_idx ON price_rules(price_book_id);
CREATE INDEX price_rules_service_idx ON price_rules(service_id);
CREATE INDEX price_rules_status_idx ON price_rules(status);
CREATE UNIQUE INDEX price_rules_active_service_book_unique ON price_rules(service_id, price_book_id) WHERE status = 'ACTIVE';
