import { describe, expect, it, vi } from "vitest";
import {
  InMemoryAuthorizationService,
  InMemoryEventDispatcher,
  InMemoryRepository,
  InMemoryUnitOfWork,
  TransactionError,
  createInfrastructureConfiguration,
} from "../index.js";
import type { ApplicationContext, IntegrationEvent } from "@creative-lab/application";
import { asActorId } from "@creative-lab/application";

type Entity = { readonly id: string; readonly organizationId: string; readonly name: string };

const context: ApplicationContext = {
  organizationId: "org-1" as never,
  actorId: asActorId("actor-1"),
};

const event: IntegrationEvent = Object.freeze({
  eventId: "evt-1",
  eventType: "TestEvent",
  eventVersion: 1,
  occurredAt: new Date("2026-01-01T00:00:00.000Z"),
  organizationId: "org-1",
  aggregateId: "aggregate-1",
  payload: Object.freeze({ value: 1 }),
});

describe("InMemoryUnitOfWork", () => {
  it("starts inactive", () => expect(new InMemoryUnitOfWork().isActive()).toBe(false));
  it("begins a transaction", async () => {
    const uow = new InMemoryUnitOfWork();
    await uow.begin();
    expect(uow.isActive()).toBe(true);
  });
  it("rejects duplicate begin", async () => {
    const uow = new InMemoryUnitOfWork();
    await uow.begin();
    await expect(uow.begin()).rejects.toBeInstanceOf(TransactionError);
  });
  it("commits an active transaction", async () => {
    const uow = new InMemoryUnitOfWork();
    await uow.begin();
    await uow.commit();
    expect(uow.isActive()).toBe(false);
  });
  it("rejects commit without a transaction", async () => {
    await expect(new InMemoryUnitOfWork().commit()).rejects.toBeInstanceOf(TransactionError);
  });
  it("rolls back an active transaction", async () => {
    const uow = new InMemoryUnitOfWork();
    await uow.begin();
    await uow.rollback();
    expect(uow.isActive()).toBe(false);
  });
  it("run commits successful work", async () => {
    const uow = new InMemoryUnitOfWork();
    await expect(uow.run(async () => 42)).resolves.toBe(42);
    expect(uow.isActive()).toBe(false);
  });
  it("run rolls back failed work", async () => {
    const uow = new InMemoryUnitOfWork();
    await expect(uow.run(async () => { throw new Error("boom"); })).rejects.toThrow("boom");
    expect(uow.isActive()).toBe(false);
  });
});

describe("InMemoryEventDispatcher", () => {
  it("publishes events", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    await dispatcher.publish(event);
    expect(dispatcher.getPublishedEvents()).toHaveLength(1);
  });
  it("dispatches matching handlers", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    const handler = vi.fn();
    dispatcher.subscribe("TestEvent", handler);
    await dispatcher.publish(event);
    expect(handler).toHaveBeenCalledWith(event);
  });
  it("supports multiple handlers", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    const first = vi.fn();
    const second = vi.fn();
    dispatcher.subscribe("TestEvent", first);
    dispatcher.subscribe("TestEvent", second);
    await dispatcher.publish(event);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });
  it("supports unsubscribe", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    const handler = vi.fn();
    const unsubscribe = dispatcher.subscribe("TestEvent", handler);
    unsubscribe();
    await dispatcher.publish(event);
    expect(handler).not.toHaveBeenCalled();
  });
  it("preserves event payload", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    await dispatcher.publish(event);
    expect(dispatcher.getPublishedEvents()[0]).toBe(event);
    expect(event.payload.value).toBe(1);
  });
  it("publishes many in order", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    const seen: string[] = [];
    dispatcher.subscribe("TestEvent", (received) => seen.push(received.eventId));
    await dispatcher.publishMany([event, { ...event, eventId: "evt-2" }]);
    expect(seen).toEqual(["evt-1", "evt-2"]);
  });
  it("propagates handler failures as infrastructure errors", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    dispatcher.subscribe("TestEvent", () => { throw new Error("failed"); });
    await expect(dispatcher.publish(event)).rejects.toThrow("failed");
  });
});

describe("InMemoryAuthorizationService", () => {
  it("denies by default", async () => {
    const service = new InMemoryAuthorizationService();
    expect(await service.can("project.create", context)).toBe(false);
  });
  it("grants configured permissions", async () => {
    const service = new InMemoryAuthorizationService();
    service.grantMembership("org-1", "actor-1", "member", ["project.create"]);
    expect(await service.can("project.create", context)).toBe(true);
  });
  it("denies ungranted permissions", async () => {
    const service = new InMemoryAuthorizationService();
    service.grantMembership("org-1", "actor-1", "member", ["project.read"]);
    expect(await service.can("project.create", context)).toBe(false);
  });
  it("denies cross-organization access", async () => {
    const service = new InMemoryAuthorizationService();
    service.grantMembership("org-2", "actor-1", "member", ["project.create"]);
    expect(await service.can("project.create", context)).toBe(false);
  });
  it("revokes membership", async () => {
    const service = new InMemoryAuthorizationService();
    service.grantMembership("org-1", "actor-1", "member", ["project.create"]);
    service.revokeMembership("org-1", "actor-1");
    expect(await service.can("project.create", context)).toBe(false);
  });
  it("asserts authorized access", async () => {
    const service = new InMemoryAuthorizationService();
    service.grantMembership("org-1", "actor-1", "member", ["project.create"]);
    await expect(service.assertCan("project.create", context)).resolves.toBeUndefined();
  });
  it("rejects unauthorized assertions", async () => {
    const service = new InMemoryAuthorizationService();
    await expect(service.assertCan("project.create", context)).rejects.toThrow("denied");
  });
});

describe("InMemoryRepository", () => {
  const repository = () => new InMemoryRepository<Entity>();
  const one: Entity = { id: "1", organizationId: "org-1", name: "One" };
  const two: Entity = { id: "2", organizationId: "org-1", name: "Two" };

  it("saves and finds by organization and id", async () => {
    const repo = repository();
    await repo.save(one);
    expect(await repo.findById("org-1", "1")).toEqual(one);
  });
  it("isolates organizations", async () => {
    const repo = repository();
    await repo.save(one);
    expect(await repo.findById("org-2", "1")).toBeNull();
  });
  it("lists organization records", async () => {
    const repo = repository();
    await repo.save(one);
    await repo.save(two);
    expect(await repo.findByOrganization("org-1")).toHaveLength(2);
  });
  it("supports replacement by identity", async () => {
    const repo = repository();
    await repo.save(one);
    const replacement = { ...one, name: "Updated" };
    await repo.save(replacement);
    expect(await repo.findById("org-1", "1")).toEqual(replacement);
  });
  it("removes records", async () => {
    const repo = repository();
    await repo.save(one);
    expect(await repo.remove("org-1", "1")).toBe(true);
    expect(await repo.exists("org-1", "1")).toBe(false);
  });
  it("clears records", async () => {
    const repo = repository();
    await repo.save(one);
    repo.clear();
    expect(repo.count()).toBe(0);
  });
});

describe("configuration", () => {
  it("defaults to development with in-memory adapters", () => {
    const config = createInfrastructureConfiguration({});
    expect(config).toEqual({ mode: "development", eventTransport: "in-memory", persistence: "in-memory" });
  });
  it("recognizes test mode", () => {
    expect(createInfrastructureConfiguration({ NODE_ENV: "test" }).mode).toBe("test");
  });
  it("recognizes production mode without changing adapter selection", () => {
    expect(createInfrastructureConfiguration({ NODE_ENV: "production" })).toEqual({
      mode: "production", eventTransport: "in-memory", persistence: "in-memory",
    });
  });
});
