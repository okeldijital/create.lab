import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Employment } from "../../aggregates/Employment/Employment.js";
import { EmploymentContract } from "../../aggregates/EmploymentContract/EmploymentContract.js";
import { Position } from "../../aggregates/Position/Position.js";
import { EmploymentType } from "../../enums/EmploymentType.js";
import { EmploymentStatus } from "../../enums/EmploymentStatus.js";
import { ContractType } from "../../enums/ContractType.js";
import { PositionStatus } from "../../enums/PositionStatus.js";
import {
  ContractConflictError,
  EmploymentConflictError,
  InvalidEmploymentPeriodError,
} from "../../errors/WorkforceErrors.js";
import { EmploymentStarted, EmploymentEnded } from "../../events/employment-events.js";
import { ContractCreated } from "../../events/contract-events.js";
import { asEmploymentId, asWorkerId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const workerId = asWorkerId("w1");

describe("Position", () => {
  it("creates and archives", () => {
    const position = Position.create({
      organizationId: orgId,
      title: "Audio Engineer",
      grade: "L3",
    });
    expect(position.status).toBe(PositionStatus.ACTIVE);
    position.archive();
    expect(position.isArchived).toBe(true);
  });
});

describe("Employment", () => {
  it("starts in PROBATION by default", () => {
    const employment = Employment.create({
      workerId,
      organizationId: orgId,
      employmentType: EmploymentType.FULL_TIME,
      startDate: new Date("2024-01-01"),
    });
    expect(employment.status).toBe(EmploymentStatus.PROBATION);
    expect(employment.pullDomainEvents()[0]).toBeInstanceOf(EmploymentStarted);
  });

  it("ends employment", () => {
    const employment = Employment.create({
      workerId,
      organizationId: orgId,
      employmentType: EmploymentType.CONTRACT,
      startDate: new Date("2024-01-01"),
      onProbation: false,
    });
    employment.pullDomainEvents();
    employment.end(new Date("2024-06-01"));
    expect(employment.status).toBe(EmploymentStatus.ENDED);
    expect(employment.pullDomainEvents()[0]).toBeInstanceOf(EmploymentEnded);
  });

  it("rejects double end", () => {
    const employment = Employment.create({
      workerId,
      organizationId: orgId,
      employmentType: EmploymentType.FULL_TIME,
      startDate: new Date("2024-01-01"),
      onProbation: false,
    });
    employment.end(new Date("2024-02-01"));
    expect(() => employment.end(new Date("2024-03-01"))).toThrow(
      EmploymentConflictError,
    );
  });
});

describe("EmploymentContract", () => {
  it("creates active contract", () => {
    const contract = EmploymentContract.create({
      employmentId: asEmploymentId("emp-1"),
      organizationId: orgId,
      contractType: ContractType.PERMANENT,
      effectiveDate: new Date("2024-01-01"),
      expiryDate: new Date("2025-01-01"),
    });
    expect(contract.isActive).toBe(true);
    expect(contract.pullDomainEvents()[0]).toBeInstanceOf(ContractCreated);
  });

  it("rejects expiry before effective", () => {
    expect(() =>
      EmploymentContract.create({
        employmentId: asEmploymentId("emp-1"),
        organizationId: orgId,
        contractType: ContractType.FIXED_TERM,
        effectiveDate: new Date("2024-06-01"),
        expiryDate: new Date("2024-01-01"),
      }),
    ).toThrow(InvalidEmploymentPeriodError);
  });

  it("expires once", () => {
    const contract = EmploymentContract.create({
      employmentId: asEmploymentId("emp-1"),
      organizationId: orgId,
      contractType: ContractType.FIXED_TERM,
      effectiveDate: new Date("2024-01-01"),
      expiryDate: new Date("2024-12-31"),
    });
    contract.pullDomainEvents();
    contract.expire(new Date("2024-12-31"));
    expect(() => contract.expire()).toThrow(ContractConflictError);
  });
});
