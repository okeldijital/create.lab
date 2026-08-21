import { describe, expect, it } from "vitest";
import {
  GetOrganizationHandler,
  type GetOrganizationHandlerDeps,
} from "../../handlers/organization/GetOrganizationHandler.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import { getOrganizationQuery } from "../../queries/GetOrganizationQuery.js";
import type { ApplicationContext } from "../../types/context.js";
import { asOrganizationId } from "@creative-lab/organization";

const context: ApplicationContext = {
  actorId: "actor-001",
  organizationId: asOrganizationId("org-001"),
  correlationId: "corr-001",
};

const deps = {
  organizationRepository: {
    findById: async () => undefined,
    existsBySlug: async () => false,
    save: async () => undefined,
    update: async () => undefined,
    findBySlug: async () => undefined,
    findAll: async () => [],
  },
  settingsRepository: {
    save: async () => undefined,
  },
  eventPublisher: {
    publish: async () => undefined,
  },
} as unknown as GetOrganizationHandlerDeps;

describe("GetOrganizationHandler tenant boundary", () => {
  it("rejects an organization outside the request context", async () => {
    const handler = new GetOrganizationHandler(deps);

    await expect(
      handler.handle(getOrganizationQuery(asOrganizationId("org-002")), context),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });
});
