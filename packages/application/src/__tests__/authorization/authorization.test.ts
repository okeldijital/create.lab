import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { AuthorizationError } from "../../errors/ApplicationErrors.js";
import {
  AllowAllAuthorization,
  DenyAllAuthorization,
  PermissionMapAuthorization,
  testContext,
} from "../helpers/fakes.js";

const ctx = testContext(asOrganizationId("org-1"));

describe("Authorization ports", () => {
  it("AllowAll allows", async () => {
    const auth = new AllowAllAuthorization();
    await expect(auth.assertCan("project.create", ctx)).resolves.toBeUndefined();
    await expect(auth.canCreateProject(ctx)).resolves.toBe(true);
    await expect(auth.canApproveInvoice(ctx)).resolves.toBe(true);
    await expect(auth.canArchiveAsset(ctx)).resolves.toBe(true);
    await expect(auth.canCreateOrganization(ctx)).resolves.toBe(true);
    await expect(auth.canApproveReview(ctx)).resolves.toBe(true);
    await expect(auth.canIssueQuote(ctx)).resolves.toBe(true);
    await expect(auth.canActivateContract(ctx)).resolves.toBe(true);
  });

  it("DenyAll denies", async () => {
    const auth = new DenyAllAuthorization();
    await expect(auth.can("project.create", ctx)).resolves.toBe(false);
    await expect(auth.assertCan("project.create", ctx)).rejects.toThrow(
      AuthorizationError,
    );
    await expect(auth.canCreateProject(ctx)).resolves.toBe(false);
  });

  it("PermissionMapAuthorization selective", async () => {
    const auth = new PermissionMapAuthorization(
      new Set(["organization.create", "project.read"]),
    );
    await expect(auth.can("organization.create", ctx)).resolves.toBe(true);
    await expect(auth.can("project.create", ctx)).resolves.toBe(false);
    await expect(auth.assertCan("project.create", ctx)).rejects.toThrow(
      AuthorizationError,
    );
  });
});
