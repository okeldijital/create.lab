import { describe, expect, it } from "vitest";
import type {
  ApplicationContext,
  CommandHandler,
  Permission,
} from "@creative-lab/application";
import {
  createApplicationComposition,
  executeCommand,
  registerCommandHandler,
} from "../index.js";

type TestCommand = {
  readonly type: "composition.test";
  readonly value: string;
};

const context: ApplicationContext = {
  organizationId: "org-test" as ApplicationContext["organizationId"],
  actorId: "actor-test" as ApplicationContext["actorId"],
  correlationId: "correlation-test",
};

const permission = "project.create" as Permission;

describe("ApplicationComposition", () => {
  it("assembles application executor with infrastructure adapters", async () => {
    const composition = createApplicationComposition();
    const handler: CommandHandler<TestCommand, string> = {
      commandType: "composition.test",
      async handle(command) {
        return command.value.toUpperCase();
      },
    };

    registerCommandHandler(composition, handler);
    const authorization = composition.authorization as {
      grantMembership?: (
        organizationId: string,
        actorId: string,
        role: string,
        permissions: Iterable<Permission>,
      ) => void;
    };
    authorization.grantMembership?.(
      "org-test",
      "actor-test",
      "tester",
      [permission],
    );

    const result = await executeCommand<string>(
      composition,
      { type: "composition.test", value: "wired" },
      context,
      { permission },
    );

    expect(result.data).toBe("WIRED");
    expect(result.eventsPublished).toBe(0);
    expect(composition.unitOfWork.isActive()).toBe(false);
  });

  it("rolls back the infrastructure transaction when a handler fails", async () => {
    const composition = createApplicationComposition();
    const handler: CommandHandler<TestCommand, never> = {
      commandType: "composition.test",
      async handle() {
        throw new Error("expected failure");
      },
    };

    registerCommandHandler(composition, handler);

    await expect(
      executeCommand(composition, { type: "composition.test", value: "x" }, context),
    ).rejects.toThrow("expected failure");

    expect(composition.unitOfWork.isActive()).toBe(false);
  });

  it("keeps repository adapter bindings at the composition boundary", () => {
    const composition = createApplicationComposition();
    const repository = { name: "test-repository" };

    composition.repositories.register("test", repository);

    expect(composition.repositories.has("test")).toBe(true);
    expect(composition.repositories.get<typeof repository>("test")).toBe(repository);
    expect(composition.repositories.has("missing")).toBe(false);
  });
});
