import { describe, expect, it } from "vitest";
import type {
  AvailabilityProfileRepository,
  CapabilityRepository,
  CapacityProfileRepository,
  ResourceCapacityRepository,
  WorkingPatternRepository,
} from "../../repositories/index.js";
import {
  InMemoryAvailabilityProfileRepository,
  InMemoryCapabilityRepository,
  InMemoryCapacityProfileRepository,
  InMemoryResourceCapacityRepository,
  InMemoryWorkingPatternRepository,
} from "../helpers/in-memory.js";

describe("Repository interface compliance", () => {
  function assertMethods(repo: object, methods: string[]): void {
    for (const m of methods) {
      expect(typeof (repo as Record<string, unknown>)[m]).toBe("function");
    }
  }

  const base = [
    "findById",
    "findAll",
    "save",
    "update",
    "archive",
    "exists",
    "findByOrganization",
  ];

  it("CapacityProfileRepository", () => {
    const repo: CapacityProfileRepository =
      new InMemoryCapacityProfileRepository();
    assertMethods(repo, [...base, "findByResource", "findActiveByResource"]);
  });

  it("CapabilityRepository", () => {
    const repo: CapabilityRepository = new InMemoryCapabilityRepository();
    assertMethods(repo, [
      ...base,
      "findByCapacityProfile",
      "findActiveByProfileAndName",
    ]);
  });

  it("AvailabilityProfileRepository", () => {
    const repo: AvailabilityProfileRepository =
      new InMemoryAvailabilityProfileRepository();
    assertMethods(repo, base);
  });

  it("WorkingPatternRepository", () => {
    const repo: WorkingPatternRepository =
      new InMemoryWorkingPatternRepository();
    assertMethods(repo, base);
  });

  it("ResourceCapacityRepository", () => {
    const repo: ResourceCapacityRepository =
      new InMemoryResourceCapacityRepository();
    assertMethods(repo, [...base, "findByCapacityProfile"]);
  });
});
