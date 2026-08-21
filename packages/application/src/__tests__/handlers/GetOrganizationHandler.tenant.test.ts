import { describe, expect, it } from "vitest";
import { GetOrganizationHandler } from "../../handlers/organization/GetOrganizationHandler.js";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import { getOrganizationQuery } from "../../queries/GetOrganizationQuery.js";
import type { ApplicationContext } from "../../types/context.js";

const context: ApplicationContext = {
  actorId: "actor-001",
  organizationId: "org-001",
  correlationId: "corr-001",
};

const deps = {
  organizationRepository: {
    findById: async () => undefined,
    existsBySlug: async () => false,
    save: async () => undefined,
    update: async () => undefined,
    archive: async () => undefined,
    findBySlug: async () => undefined,
    findAll: async () => [],
  },
  settingsRepository: {
    save: async () => undefined,
  },
  eventPublisher: {
    publish: async () => undefined,
  },
};

describe("GetOrganizationHandler tenant boundary", () => {
  it("rejects an organization outside the request context", async () => {
    const handler = new GetOrganizationHandler(deps);

    await expect(
      handler.handle(getOrganizationQuery("org-002"), context),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });
});
