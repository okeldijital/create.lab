import { describe, expect, it } from "vitest";
import { AuthorizationError } from "../errors/ApplicationErrors.js";
import { DefaultAuthorizationService, type MembershipReader } from "../authorization/DefaultAuthorizationService.js";
import type { ApplicationContext } from "../types/context.js";
import type { OrganizationMembership } from "@creative-lab/organization";

const organizationId = "org-1" as ApplicationContext["organizationId"];
const otherOrganizationId = "org-2" as ApplicationContext["organizationId"];
const context = {
  organizationId,
  actorId: "actor-1" as ApplicationContext["actorId"],
} satisfies ApplicationContext;

function membership(role: OrganizationMembership["role"], active = true, org = organizationId): OrganizationMembership {
  return { actorId: "actor-1", organizationId: org, role, active };
}

function reader(result: OrganizationMembership | null): MembershipReader {
  return {
    findMembership: async () => result,
  };
}

describe("DefaultAuthorizationService", () => {
  it("allows an active owner to create projects", async () => {
    const service = new DefaultAuthorizationService(reader(membership("owner")));
    await expect(service.canCreateProject(context)).resolves.toBe(true);
  });

  it("denies inactive memberships", async () => {
    const service = new DefaultAuthorizationService(reader(membership("owner", false)));
    await expect(service.canCreateProject(context)).resolves.toBe(false);
  });

  it("denies cross-organization membership", async () => {
    const service = new DefaultAuthorizationService(reader(membership("owner", true, otherOrganizationId)));
    await expect(service.canCreateProject(context)).resolves.toBe(false);
  });

  it("denies a member from owner-only organization creation", async () => {
    const service = new DefaultAuthorizationService(reader(membership("member")));
    await expect(service.canCreateOrganization(context)).resolves.toBe(false);
  });

  it("throws the governed authorization error on assertion failure", async () => {
    const service = new DefaultAuthorizationService(reader(null));
    await expect(service.assertCan("project.create", context)).rejects.toBeInstanceOf(AuthorizationError);
  });
});
