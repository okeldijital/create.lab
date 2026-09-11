import { describe, expect, it } from "vitest";
import { CurrentIdentityService } from "./CurrentIdentityService.js";

describe("CurrentIdentityService", () => {
  const actorId = "user-123";
  const organizationId = "org-456";

  const membership = {
    actorId,
    organizationId,
    role: "member" as const,
    active: true,
  };

  it("returns no application identity for an absent session", async () => {
    const memberships = {
      findMembership: async () => membership,
    };

    await expect(new CurrentIdentityService(memberships).resolveFromBetterAuthSession(null)).resolves.toBeNull();
  });

  it("resolves an authenticated session only when active membership matches", async () => {
    const memberships = {
      findMembership: async (actor: string, organization: string) =>
        actor === actorId && organization === organizationId ? membership : null,
    };

    await expect(
      new CurrentIdentityService(memberships).resolveFromBetterAuthSession({
        user: { id: actorId },
        organizationId,
      }),
    ).resolves.toMatchObject({ actorId, organizationId });
  });

  it("fails closed when membership is absent or inactive", async () => {
    const memberships = {
      findMembership: async () => ({ ...membership, active: false }),
    };

    await expect(
      new CurrentIdentityService(memberships).resolveFromBetterAuthSession({
        user: { id: actorId },
        organizationId,
      }),
    ).resolves.toBeNull();
  });

  it("fails closed when the session has no organization context", async () => {
    const memberships = {
      findMembership: async () => membership,
    };

    await expect(
      new CurrentIdentityService(memberships).resolveFromBetterAuthSession({
        user: { id: actorId },
      }),
    ).resolves.toBeNull();
  });
});
