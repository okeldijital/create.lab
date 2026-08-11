import { describe, expect, it } from "vitest";
import type {
  EmploymentContractRepository,
  EmploymentRepository,
  PositionRepository,
  ReportingRelationshipRepository,
  WorkerRepository,
} from "../../repositories/index.js";
import {
  InMemoryEmploymentContractRepository,
  InMemoryEmploymentRepository,
  InMemoryPositionRepository,
  InMemoryReportingRelationshipRepository,
  InMemoryWorkerRepository,
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
    "delete",
  ];

  it("WorkerRepository", () => {
    const repo: WorkerRepository = new InMemoryWorkerRepository();
    assertMethods(repo, [
      ...base,
      "findByOrganization",
      "findByEmail",
      "findByEmployeeNumber",
    ]);
  });

  it("PositionRepository", () => {
    const repo: PositionRepository = new InMemoryPositionRepository();
    assertMethods(repo, [...base, "findByOrganization", "findByTitle"]);
  });

  it("EmploymentRepository", () => {
    const repo: EmploymentRepository = new InMemoryEmploymentRepository();
    assertMethods(repo, [
      ...base,
      "findByOrganization",
      "findByWorker",
      "findActiveByWorker",
    ]);
  });

  it("EmploymentContractRepository", () => {
    const repo: EmploymentContractRepository =
      new InMemoryEmploymentContractRepository();
    assertMethods(repo, [
      ...base,
      "findByOrganization",
      "findByEmployment",
      "findActiveByEmployment",
    ]);
  });

  it("ReportingRelationshipRepository", () => {
    const repo: ReportingRelationshipRepository =
      new InMemoryReportingRelationshipRepository();
    assertMethods(repo, [
      ...base,
      "findByOrganization",
      "findActiveByWorker",
      "findActiveByManager",
    ]);
  });
});
