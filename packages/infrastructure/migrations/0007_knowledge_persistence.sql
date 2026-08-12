CREATE TABLE knowledge_categories (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  CONSTRAINT knowledge_categories_org_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX knowledge_categories_organization_idx ON knowledge_categories(organization_id);
CREATE INDEX knowledge_categories_status_idx ON knowledge_categories(status);

CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  article_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES knowledge_categories(id),
  current_version_id UUID,
  reference_ids UUID[] NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  CONSTRAINT knowledge_articles_org_number_unique UNIQUE (organization_id, article_number)
);

CREATE INDEX knowledge_articles_organization_idx ON knowledge_articles(organization_id);
CREATE INDEX knowledge_articles_category_idx ON knowledge_articles(category_id);
CREATE INDEX knowledge_articles_current_version_idx ON knowledge_articles(current_version_id);
CREATE INDEX knowledge_articles_status_idx ON knowledge_articles(status);

CREATE TABLE knowledge_versions (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  article_id UUID NOT NULL REFERENCES knowledge_articles(id),
  version_number BIGINT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT knowledge_versions_article_version_unique UNIQUE (article_id, version_number),
  CONSTRAINT knowledge_versions_number_positive CHECK (version_number >= 1)
);

CREATE INDEX knowledge_versions_article_idx ON knowledge_versions(article_id);
CREATE INDEX knowledge_versions_organization_idx ON knowledge_versions(organization_id);
CREATE INDEX knowledge_versions_status_idx ON knowledge_versions(status);
CREATE UNIQUE INDEX knowledge_versions_current_unique ON knowledge_versions(article_id) WHERE status = 'CURRENT';

ALTER TABLE knowledge_articles
  ADD CONSTRAINT knowledge_articles_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES knowledge_versions(id);

CREATE TABLE knowledge_references (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  source_article_id UUID NOT NULL REFERENCES knowledge_articles(id),
  target_article_id UUID NOT NULL REFERENCES knowledge_articles(id),
  relationship_type TEXT NOT NULL,
  label TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT knowledge_references_not_self CHECK (source_article_id <> target_article_id),
  CONSTRAINT knowledge_references_identity_unique UNIQUE (source_article_id, target_article_id, relationship_type)
);

CREATE INDEX knowledge_references_organization_idx ON knowledge_references(organization_id);
CREATE INDEX knowledge_references_source_idx ON knowledge_references(source_article_id);
CREATE INDEX knowledge_references_target_idx ON knowledge_references(target_article_id);
CREATE INDEX knowledge_references_relationship_idx ON knowledge_references(relationship_type);
