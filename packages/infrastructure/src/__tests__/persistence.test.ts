import { describe, expect, it, vi } from "vitest";
import {
  PostgresUnitOfWork,
  postgresConfigurationFromEnvironment,
} from "../persistence/index.js";
import type { PostgresClient } from "../persistence/index.js";

describe("PostgreSQL persistence foundation", () => {
  it("requires DATABASE_URL", () => {
    expect(() => postgresConfigurationFromEnvironment({})).toThrow("DATABASE_URL is required");
  });

  it("maps supported environment configuration", () => {
    expect(
      postgresConfigurationFromEnvironment({
        DATABASE_URL: "postgres://localhost/creative_lab",
        DATABASE_MAX_CONNECTIONS: "20",
        DATABASE_IDLE_TIMEOUT: "30",
        DATABASE_CONNECT_TIMEOUT: "15",
        DATABASE_PREPARE: "false",
      }),
    ).toEqual({
      connectionString: "postgres://localhost/creative_lab",
      maxConnections: 20,
      idleTimeoutSeconds: 30,
      connectTimeoutSeconds: 15,
      prepareStatements: false,
    });
  });

  it("rejects invalid numeric configuration", () => {
    expect(() =>
      postgresConfigurationFromEnvironment({
        DATABASE_URL: "postgres://localhost/creative_lab",
        DATABASE_MAX_CONNECTIONS: "not-a-number",
      }),
    ).toThrow("Expected a non-negative integer");
  });

  it("binds begin/commit to one reserved connection", async () => {
    const execute = vi.fn(async () => []);
    const release = vi.fn(async () => undefined);
    const reserved = Object.assign(execute, { release });
    const client = Object.assign(vi.fn(async () => []), {
      reserve: vi.fn(async () => reserved),
    }) as unknown as PostgresClient;

    const uow = new PostgresUnitOfWork(client);
    expect(uow.isActive()).toBe(false);

    await uow.begin();
    expect(uow.isActive()).toBe(true);
    expect(client.reserve).toHaveBeenCalledOnce();

    await uow.commit();
    expect(uow.isActive()).toBe(false);
    expect(release).toHaveBeenCalledOnce();
    expect(execute).toHaveBeenCalledWith(["begin"]);
    expect(execute).toHaveBeenCalledWith(["commit"]);
  });

  it("rolls back and releases the reserved connection", async () => {
    const execute = vi.fn(async () => []);
    const release = vi.fn(async () => undefined);
    const reserved = Object.assign(execute, { release });
    const client = Object.assign(vi.fn(async () => []), {
      reserve: vi.fn(async () => reserved),
    }) as unknown as PostgresClient;

    const uow = new PostgresUnitOfWork(client);
    await uow.begin();
    await uow.rollback();

    expect(uow.isActive()).toBe(false);
    expect(release).toHaveBeenCalledOnce();
    expect(execute).toHaveBeenCalledWith(["rollback"]);
  });
});
