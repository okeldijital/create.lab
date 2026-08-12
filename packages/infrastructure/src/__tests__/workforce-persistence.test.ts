import { describe, expect, it } from "vitest";
import type { InferSelectModel } from "drizzle-orm";
import {
  ContractStatus,
  ContractType,
  Employment,
  EmploymentContract,
  EmploymentStatus,
  EmploymentType,
  Position,
  PositionStatus,
  ReportingRelationship,
  Worker,
  WorkerStatus,
  asEmploymentContractId,
  asEmploymentId,
  asOrganizationId,
  asDepartmentId,
  asPositionId,
  asReportingRelationshipId,
  asTeamId,
  asWorkerId,
} from "@creative-lab/workforce";
import {
  EmploymentContractMapper,
  EmploymentMapper,
  PositionMapper,
  ReportingRelationshipMapper,
  WorkerMapper,
} from "../persistence/workforce/mappers.js";
import {
  employmentContracts,
  employments,
  positions,
  reportingRelationships,
  workers,
} from "../persistence/workforce/schema.js";

const organizationId = asOrganizationId("00000000-0000-0000-0000-000000000001");
const workerId = asWorkerId("00000000-0000-0000-0000-000000000002");
const positionId = asPositionId("00000000-0000-0000-0000-000000000003");
const employmentId = asEmploymentId("00000000-0000-0000-0000-000000000004");
const contractId = asEmploymentContractId("00000000-0000-0000-0000-000000000005");
const relationshipId = asReportingRelationshipId("00000000-0000-0000-0000-000000000006");
const managerId = asWorkerId("00000000-0000-0000-0000-000000000007");
const departmentId = asDepartmentId("00000000-0000-0000-0000-000000000008");
const teamId = asTeamId("00000000-0000-0000-0000-000000000009");
const now = new Date("2026-01-15T10:00:00.000Z");

function roundTrip<T>(toRow: (value: T) => unknown, fromRow: (row: unknown) => T, value: T): T {
  return fromRow(toRow(value));
}

describe("Workforce persistence mappers", () => {
  it("round-trips Position", () => {
    const position = Position.reconstitute({
      id: positionId,
      organizationId,
      title: "Senior Producer",
      description: "Production leadership",
      grade: "P4",
      status: PositionStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });
    const restored = roundTrip(
      (value) => PositionMapper.toRow(value),
      (row) => PositionMapper.fromRow(row as InferSelectModel<typeof positions>),
      position,
    );
    expect(restored.toSnapshot()).toEqual(position.toSnapshot());
  });

  it("round-trips Worker with nullable relationships", () => {
    const worker = Worker.reconstitute({
      id: workerId,
      organizationId,
      employeeNumber: "EMP-0001",
      firstName: "Leko",
      lastName: "Nkosi",
      preferredName: null,
      email: "worker@example.com",
      phone: null,
      status: WorkerStatus.ACTIVE,
      employmentType: EmploymentType.FULL_TIME,
      positionId,
      departmentId,
      teamId,
      managerId: null,
      dateJoined: now,
      dateLeft: null,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    });
    const restored = roundTrip(
      (value) => WorkerMapper.toRow(value),
      (row) => WorkerMapper.fromRow(row as InferSelectModel<typeof workers>),
      worker,
    );
    expect(restored.toSnapshot()).toEqual(worker.toSnapshot());
  });

  it("round-trips Employment", () => {
    const employment = Employment.reconstitute({
      id: employmentId,
      workerId,
      organizationId,
      employmentType: EmploymentType.FULL_TIME,
      startDate: now,
      endDate: null,
      status: EmploymentStatus.ACTIVE,
      workingHoursPerWeek: 40,
      probationDays: 90,
      probationActive: false,
      noticePeriodDays: 30,
      createdAt: now,
      updatedAt: now,
    });
    const restored = roundTrip(
      (value) => EmploymentMapper.toRow(value),
      (row) => EmploymentMapper.fromRow(row as InferSelectModel<typeof employments>),
      employment,
    );
    expect(restored.toSnapshot()).toEqual(employment.toSnapshot());
  });

  it("round-trips EmploymentContract", () => {
    const contract = EmploymentContract.reconstitute({
      id: contractId,
      employmentId,
      organizationId,
      contractType: ContractType.PERMANENT,
      effectiveDate: now,
      expiryDate: null,
      noticePeriodDays: 30,
      status: ContractStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });
    const restored = roundTrip(
      (value) => EmploymentContractMapper.toRow(value),
      (row) => EmploymentContractMapper.fromRow(row as InferSelectModel<typeof employmentContracts>),
      contract,
    );
    expect(restored.toSnapshot()).toEqual(contract.toSnapshot());
  });

  it("round-trips ReportingRelationship", () => {
    const relationship = ReportingRelationship.reconstitute({
      id: relationshipId,
      organizationId,
      workerId,
      managerId,
      effectiveDate: now,
      endDate: null,
      createdAt: now,
      updatedAt: now,
    });
    const restored = roundTrip(
      (value) => ReportingRelationshipMapper.toRow(value),
      (row) => ReportingRelationshipMapper.fromRow(row as InferSelectModel<typeof reportingRelationships>),
      relationship,
    );
    expect(restored.toSnapshot()).toEqual(relationship.toSnapshot());
  });
});
