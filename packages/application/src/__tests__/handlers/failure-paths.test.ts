import { describe, expect, it, beforeEach } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { createProjectCommand } from "../../commands/index.js";
import {
  AuthorizationError,
  HandlerNotFoundError,
  ValidationError,
} from "../../errors/ApplicationErrors.js";
import { CreateProjectHandler } from "../../handlers/index.js";
import { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import { UseCaseExecutor } from "../../services/UseCaseExecutor.js";
import {
  AllowAllAuthorization,
  DenyAllAuthorization,
  InMemoryEventDispatcher,
  InMemoryOrganizationRepository,
  InMemoryProjectRepository,
  InMemoryUnitOfWork,
  testContext,
} from "../helpers/fakes.js";

describe("Handler failure paths", () => {
  const orgId = asOrganizationId("org-fail");
  let executor: UseCaseExecutor;
  let uow: InMemoryUnitOfWork;
  let events: CollectingEventPublisher;

  beforeEach(() => {
    uow = new InMemoryUnitOfWork();
    events = new CollectingEventPublisher();
    const orgs = new InMemoryOrganizationRepository();
    const projects = new InMemoryProjectRepository();
    const handler = new CreateProjectHandler({
      projectRepository: projects,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    executor = new UseCaseExecutor({
      unitOfWork: uow,
      eventDispatcher: new InMemoryEventDispatcher(),
      authorization: new AllowAllAuthorization(),
    });
    executor.registerCommandHandler(handler as never);
  });

  it("validation failure rolls back", async () => {
    await expect(
      executor.executeCommand(
        createProjectCommand({ name: "" }),
        testContext(orgId),
      ),
    ).rejects.toThrow(ValidationError);
    expect(uow.rolledBack).toBe(1);
  });

  it("missing organization fails after begin", async () => {
    await expect(
      executor.executeCommand(
        createProjectCommand({ name: "Orphan" }),
        testContext(orgId),
        { collectDomainEvents: () => events.drain() },
      ),
    ).rejects.toThrow();
    expect(uow.rolledBack).toBe(1);
  });

  it("authorization short-circuits before UoW", async () => {
    const denied = new UseCaseExecutor({
      unitOfWork: uow,
      eventDispatcher: new InMemoryEventDispatcher(),
      authorization: new DenyAllAuthorization(),
    });
    denied.registerCommandHandler(
      new CreateProjectHandler({
        projectRepository: new InMemoryProjectRepository(),
        organizationRepository: new InMemoryOrganizationRepository(),
        eventPublisher: events,
      }) as never,
    );
    await expect(
      denied.executeCommand(
        createProjectCommand({ name: "X" }),
        testContext(orgId),
        { permission: "project.create" },
      ),
    ).rejects.toThrow(AuthorizationError);
    expect(uow.began).toBe(0);
  });

  it("unregistered command type", async () => {
    await expect(
      executor.executeCommand({ type: "NoSuchCommand" }, testContext(orgId)),
    ).rejects.toThrow(HandlerNotFoundError);
  });
});
