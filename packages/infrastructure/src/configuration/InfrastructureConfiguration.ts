export type InfrastructureMode = "test" | "development" | "production";

export type InfrastructureConfiguration = Readonly<{
  mode: InfrastructureMode;
  eventTransport: "in-memory";
  persistence: "in-memory";
}>;

export function createInfrastructureConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): InfrastructureConfiguration {
  const mode = env.NODE_ENV === "production"
    ? "production"
    : env.NODE_ENV === "test"
      ? "test"
      : "development";

  return Object.freeze({
    mode,
    eventTransport: "in-memory" as const,
    persistence: "in-memory" as const,
  });
}
