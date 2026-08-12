import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresConfiguration } from "./PostgresConfiguration.js";

export type PostgresClient = ReturnType<typeof postgres>;
export type DrizzleDatabase = ReturnType<typeof drizzle>;

export interface PostgresDatabase {
  client: PostgresClient;
  db: DrizzleDatabase;
  close(): Promise<void>;
}

/**
 * Creates the infrastructure-owned PostgreSQL client and Drizzle database.
 * No domain schema is declared here; domain schemas are introduced by the
 * owning persistence adapters when their bounded-context persistence is built.
 */
export function createPostgresDatabase(config: PostgresConfiguration): PostgresDatabase {
  const client = postgres(config.connectionString, {
    max: config.maxConnections,
    idle_timeout: config.idleTimeoutSeconds,
    connect_timeout: config.connectTimeoutSeconds,
    prepare: config.prepareStatements,
  });

  const db = drizzle({ client });

  return {
    client,
    db,
    close: () => client.end({ timeout: 5 }),
  };
}

export async function checkPostgresConnection(client: PostgresClient): Promise<void> {
  await client`select 1 as health_check`;
}
