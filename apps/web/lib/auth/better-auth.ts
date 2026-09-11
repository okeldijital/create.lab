import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  createPostgresDatabase,
  postgresConfigurationFromEnvironment,
  PostgresOrganizationMembershipRepository,
} from "@creative-lab/infrastructure";

function createBetterAuthRuntime() {
  const database = createPostgresDatabase(postgresConfigurationFromEnvironment());
  const auth = betterAuth({
    database: drizzleAdapter(database.db, { provider: "pg" }),
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

/**
 * Provider boundary for Better Auth.
 *
 * Better Auth owns authentication/session verification. Application
 * authorization remains in the application/infrastructure membership boundary.
 * Runtime configuration remains lazy so deployment environment variables are
 * resolved when the provider boundary is first invoked.
 */
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
