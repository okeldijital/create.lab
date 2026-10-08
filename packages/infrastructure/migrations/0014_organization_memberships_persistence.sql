CREATE TABLE IF NOT EXISTS organization_memberships (
  actor_id text NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  role text NOT NULL,
  active integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT organization_memberships_actor_org_unique UNIQUE (actor_id, organization_id)
);

CREATE INDEX IF NOT EXISTS organization_memberships_organization_idx
  ON organization_memberships (organization_id);
CREATE INDEX IF NOT EXISTS organization_memberships_actor_idx
  ON organization_memberships (actor_id);
