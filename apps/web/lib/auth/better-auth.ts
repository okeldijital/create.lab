import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  authSchema,
  createPostgresDatabase,
  postgresConfigurationFromEnvironment,
  PostgresOrganizationMembershipRepository,
} from "@creative-lab/infrastructure";

const AUTH_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "email_verified" BOOLEAN NOT NULL,
  image TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS session_user_idx ON "session"("user_id");
CREATE INDEX IF NOT EXISTS session_expires_idx ON "session"("expires_at");

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  issuer TEXT,
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
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS account_user_idx ON account("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS account_provider_identity_unique
  ON account (provider_id, account_id);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier);
CREATE INDEX IF NOT EXISTS verification_expires_idx ON verification("expires_at");
`;

function createBetterAuthRuntime() {
  const database = createPostgresDatabase(postgresConfigurationFromEnvironment());
  const auth = betterAuth({
    database: drizzleAdapter(database.db, {
      provider: "pg",
      schema: authSchema,
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    user: {
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    session: {
      fields: {
        userId: "user_id",
        expiresAt: "expires_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    account: {
      fields: {
        userId: "user_id",
        accountId: "account_id",
        providerId: "provider_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        idToken: "id_token",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    verification: {
      fields: {
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
  });

  return {
    auth,
    database,
    memberships: new PostgresOrganizationMembershipRepository(database.db),
  };
}

let runtime: ReturnType<typeof createBetterAuthRuntime> | undefined;
let schemaReady: Promise<void> | undefined;

export function getBetterAuthRuntime() {
  runtime ??= createBetterAuthRuntime();
  return runtime;
}

export function getBetterAuth() {
  return getBetterAuthRuntime().auth;
}

export function getBetterAuthMemberships() {
  return getBetterAuthRuntime().memberships;
}

export function ensureBetterAuthSchema() {
  schemaReady ??= getBetterAuthRuntime()
    .database.client.unsafe(AUTH_TABLES_SQL)
    .then(() => undefined);
  return schemaReady;
}
