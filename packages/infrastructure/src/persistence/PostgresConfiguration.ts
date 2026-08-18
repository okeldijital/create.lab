/** PostgreSQL connection configuration for the persistence boundary. */
export interface PostgresConfiguration {
  connectionString: string;
  maxConnections?: number;
  idleTimeoutSeconds?: number;
  connectTimeoutSeconds?: number;
  prepareStatements?: boolean;
}

export function postgresConfigurationFromEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): PostgresConfiguration {
  const connectionString = env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PostgreSQL infrastructure");
  }

  return {
    connectionString,
    maxConnections: parsePositiveInteger(env.DATABASE_MAX_CONNECTIONS, 10),
    idleTimeoutSeconds: parsePositiveInteger(env.DATABASE_IDLE_TIMEOUT, 0),
    connectTimeoutSeconds: parsePositiveInteger(env.DATABASE_CONNECT_TIMEOUT, 30),
    prepareStatements: env.DATABASE_PREPARE !== "false",
  };
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Expected a non-negative integer, received: ${value}`);
  }
  return parsed;
}
