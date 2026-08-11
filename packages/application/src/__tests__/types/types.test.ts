import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asActorId } from "../../types/ids.js";
import type { ApplicationContext } from "../../types/context.js";
import type { Permission } from "../../types/ids.js";

describe("Application types", () => {
  it("asActorId brands string", () => {
    const id = asActorId("user-1");
    expect(id).toBe("user-1");
  });

  it("ApplicationContext shape", () => {
    const ctx: ApplicationContext = {
      organizationId: asOrganizationId("org"),
      actorId: asActorId("actor"),
      correlationId: "c",
      metadata: { source: "test" },
    };
    expect(ctx.metadata?.source).toBe("test");
  });

  it("Permission union includes key actions", () => {
    const permissions: Permission[] = [
      "organization.create",
      "project.create",
      "invoice.create",
      "quote.issue",
      "contract.activate",
      "knowledge.search",
      "asset.archive",
      "review.approve",
    ];
    expect(permissions.length).toBe(8);
  });
});
