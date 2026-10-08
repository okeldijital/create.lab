CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "email_verified" BOOLEAN NOT NULL,
  image TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE INDEX session_user_idx ON "session"("user_id");
CREATE INDEX session_expires_idx ON "session"("expires_at");

CREATE TABLE account (
  id TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  issuer TEXT NOT NULL,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "access_token_expires_at" TIMESTAMPTZ,
  "refresh_token_expires_at" TIMESTAMPTZ,
  scope TEXT,
  "id_token" TEXT,
  password TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT account_provider_identity_unique UNIQUE (issuer, "account_id")
);

CREATE INDEX account_user_idx ON account("user_id");

CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE INDEX verification_identifier_idx ON verification(identifier);
CREATE INDEX verification_expires_idx ON verification("expires_at");
