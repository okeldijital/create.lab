import { describe, expect, it, beforeEach } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import type { Command } from "../../commands/Command.js";
import {
  AuthorizationError,
  HandlerNotFoundError,
} from "../../errors/ApplicationErrors.js";
import type { CommandHandler, QueryHandler } from "../../interfaces/Handler.js";
import type { Query } from "../../queries/Query.js";
import { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import { UseCaseExecutor } from "../../services/UseCaseExecutor.js";
import type { ApplicationContext } from "../../types/context.js";
import {
  AllowAllAuthorization,
  DenyAllAuthorization,
  InMemoryEventDispatcher,
  InMemoryUnitOfWork,
  testContext,
} from "../helpers/fakes.js";

type Ping = Command<"Ping"> & { value: string };
type Pong = Query<"Pong"> & { id: string };

class PingHandler implements CommandHandler<Ping, { ok: boolean }> {
  readonly commandType = "Ping" as const;
  async handle(command: Ping): Promise<{ ok: boolean }> {
    if (command.value === "fail") throw new Error("boom");
    return { ok: true };
  }
}

class PongHandler implements QueryHandler<Pong, string> {
  readonly queryType = "Pong" as const;
  async handle(query: Pong): Promise<string> {
    return query.id;
  }
}

describe("UseCaseExecutor", () => {
  let uow: InMemoryUnitOfWork;
  let events: InMemoryEventDispatcher;
  let executor: UseCaseExecutor;
  let ctx: ApplicationContext;

  beforeEach(() => {
    uow = new InMemoryUnitOfWork();
    events = new InMemoryEventDispatcher();
    executor = new UseCaseExecutor({
      unitOfWork: uow,
      eventDispatcher: events,
      authorization: new AllowAllAuthorization(),
    });
    executor.registerCommandHandler(new PingHandler() as never);
    executor.registerQueryHandler(new PongHandler() as never);
    ctx = testContext(asOrganizationId("org-1"));
  });

  it("executes command with transaction commit", async () => {
    const result = await executor.executeCommand<{ ok: boolean }>(
      { type: "Ping", value: "hi" } as Command,
      ctx,
    );
    expect(result.data.ok).toBe(true);
    expect(uow.committed).toBe(1);
    expect(uow.rolledBack).toBe(0);
  });

  it("rolls back on handler failure", async () => {
    await expect(
      executor.executeCommand({ type: "Ping", value: "fail" } as Command, ctx),
    ).rejects.toThrow("boom");
    expect(uow.rolledBack).toBe(1);
    expect(uow.committed).toBe(0);
  });

  it("throws HandlerNotFoundError for unknown command", async () => {
    await expect(
      executor.executeCommand({ type: "Unknown" }, ctx),
    ).rejects.toThrow(HandlerNotFoundError);
  });

  it("enforces authorization on command", async () => {
    const denied = new UseCaseExecutor({
      unitOfWork: uow,
      eventDispatcher: events,
      authorization: new DenyAllAuthorization(),
    });
    denied.registerCommandHandler(new PingHandler() as never);
    await expect(
      denied.executeCommand(
        { type: "Ping", value: "x" } as Command,
        ctx,
        { permission: "project.create" },
      ),
    ).rejects.toThrow(AuthorizationError);
    expect(uow.began).toBe(0);
  });

  it("executes query without transaction", async () => {
    const result = await executor.executeQuery<string>(
      { type: "Pong", id: "abc" } as Query,
      ctx,
    );
    expect(result.data).toBe("abc");
    expect(uow.began).toBe(0);
  });

  it("query authorization deny", async () => {
    const denied = new UseCaseExecutor({
      unitOfWork: uow,
      eventDispatcher: events,
      authorization: new DenyAllAuthorization(),
    });
    denied.registerQueryHandler(new PongHandler() as never);
    await expect(
      denied.executeQuery(
        { type: "Pong", id: "x" } as Query,
        ctx,
        { permission: "project.read" },
      ),
    ).rejects.toThrow(AuthorizationError);
  });

  it("unknown query handler", async () => {
    await expect(
      executor.executeQuery({ type: "Nope" }, ctx),
    ).rejects.toThrow(HandlerNotFoundError);
  });

  it("CollectingEventPublisher drains", async () => {
    const collector = new CollectingEventPublisher();
    await collector.publish([
      {
        eventId: "1",
        eventType: "E",
        eventVersion: 1,
        occurredAt: new Date(),
        aggregateId: "a",
        organizationId: "o",
        payload: {},
      } as never,
    ]);
    expect(collector.collected).toHaveLength(1);
    const drained = collector.drain();
    expect(drained).toHaveLength(1);
    expect(collector.collected).toHaveLength(0);
    collector.clear();
  });

  it("publishes integration events when collector provided", async () => {
    const collector = new CollectingEventPublisher();
    await collector.publish([
      {
        eventId: "e1",
        eventType: "Created",
        eventVersion: 1,
        occurredAt: new Date(),
        aggregateId: "a",
        organizationId: "o",
        payload: { x: 1 },
      } as never,
    ]);
    await executor.executeCommand(
      { type: "Ping", value: "ok" } as Command,
      ctx,
      { collectDomainEvents: () => collector.drain() },
    );
    expect(events.events).toHaveLength(1);
  });
});
