import { describe, expect, it } from "vitest";
import type {
  DepartmentRepository,
  OrganizationRepository,
  OrganizationSettingsRepository,
  StudioRepository,
  TeamRepository,
} from "../../repositories/index.js";
import {
  InMemoryDepartmentRepository,
  InMemoryOrganizationRepository,
  InMemoryOrganizationSettingsRepository,
  InMemoryStudioRepository,
  InMemoryTeamRepository,
} from "../helpers/in-memory.js";

/**
 * Interface compliance: in-memory fakes implement every required port method.
 */
describe("Repository interface compliance", () => {
  const requiredMethods = [
    "findById",
    "findAll",
    "save",
    "update",
    "archive",
    "exists",
    "delete",
  ] as const;

  function assertPort(
    repo: object,
    extra: readonly string[] = [],
  ): void {
    for (const method of [...requiredMethods, ...extra]) {
      expect(typeof (repo as Record<string, unknown>)[method]).toBe("function");
    }
  }

  it("OrganizationRepository", () => {
    const repo: OrganizationRepository = new InMemoryOrganizationRepository();
    assertPort(repo, ["findBySlug", "existsBySlug"]);
  });

  it("DepartmentRepository", () => {
    const repo: DepartmentRepository = new InMemoryDepartmentRepository();
    assertPort(repo, [
      "findByOrganizationId",
      "findByNameInOrganization",
      "existsByNameInOrganization",
    ]);
  });

  it("TeamRepository", () => {
    const repo: TeamRepository = new InMemoryTeamRepository();
    assertPort(repo, [
      "findByOrganizationId",
      "findByDepartmentId",
      "findByNameInDepartment",
      "existsByNameInDepartment",
    ]);
  });

  it("StudioRepository", () => {
    const repo: StudioRepository = new InMemoryStudioRepository();
    assertPort(repo, [
      "findByOrganizationId",
      "findByNameInOrganization",
      "existsByNameInOrganization",
    ]);
  });

  it("OrganizationSettingsRepository", () => {
    const repo: OrganizationSettingsRepository =
      new InMemoryOrganizationSettingsRepository();
    assertPort(repo, ["findByOrganizationId"]);
  });
});
