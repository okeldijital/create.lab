import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  createPostgresDatabase,
  postgresConfigurationFromEnvironment,
  PostgresOrganizationMembershipRepository,
} from "@creative-lab/infrastructure";

let runtime:
  | {
      auth: ReturnType<typeof betterAuth>;
      database: ReturnType<typeof createPostgresDatabase>;
      memberships: PostgresOrganizationMembershipRepository;
    }
  | undefined;

/**
 * Provider boundary for Better Auth.
 *
 * Better Auth owns authentication/session verification. Application
 * authorization remains in the application/infrastructure membership boundary.
 */
export function getBetterAuthRuntime() {
  if (!runtime) {
    const database = createPostgresDatabase(postgresConfigurationFromEnvironment());
    const auth = betterAuth({
      database: drizzleAdapter(database.db, { provider: "pg" }),
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL,
      emailAndPassword: {
        enabled: true,
      },
    });

    runtime = {
      auth,
      database,
      memberships: new PostgresOrganizationMembershipRepository(database.db),
    };
  }

  return runtime;
}

export function getBetterAuth() {
  return getBetterAuthRuntime().auth;
}

export function getBetterAuthMemberships() {
  return getBetterAuthRuntime().memberships;
}
