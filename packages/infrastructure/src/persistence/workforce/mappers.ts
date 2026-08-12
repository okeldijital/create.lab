import {
  Employment,
  type EmploymentSnapshot,
  EmploymentContract,
  type EmploymentContractSnapshot,
  Position,
  type PositionSnapshot,
  ReportingRelationship,
  type ReportingRelationshipSnapshot,
  Worker,
  type WorkerSnapshot,
  asEmploymentContractId,
  asEmploymentId,
  asPositionId,
  asReportingRelationshipId,
  asWorkerId,
} from "@creative-lab/workforce";
import type { InferSelectModel } from "drizzle-orm";
import type {
  employmentContracts,
  employments,
  positions,
  reportingRelationships,
  workers,
} from "./schema.js";

type PositionRow = InferSelectModel<typeof positions>;
type WorkerRow = InferSelectModel<typeof workers>;
type EmploymentRow = InferSelectModel<typeof employments>;
type ContractRow = InferSelectModel<typeof employmentContracts>;
type ReportingRow = InferSelectModel<typeof reportingRelationships>;

export const PositionMapper = {
  toRow(position: Position): PositionRow {
    const s = position.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      title: s.title,
      description: s.description ?? null,
      grade: s.grade ?? null,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: PositionRow): Position {
    const snapshot: PositionSnapshot = {
      id: asPositionId(row.id),
      organizationId: row.organizationId as PositionSnapshot["organizationId"],
      title: row.title,
      description: row.description ?? null,
      grade: row.grade ?? null,
      status: row.status as PositionSnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Position.reconstitute(snapshot);
  },
};

export const WorkerMapper = {
  toRow(worker: Worker): WorkerRow {
    const s = worker.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      employeeNumber: s.employeeNumber,
      firstName: s.firstName,
      lastName: s.lastName,
      preferredName: s.preferredName ?? null,
      email: s.email,
      phone: s.phone ?? null,
      status: s.status,
      employmentType: s.employmentType,
      positionId: s.positionId ?? null,
      departmentId: s.departmentId,
      teamId: s.teamId ?? null,
      managerId: s.managerId ?? null,
      dateJoined: s.dateJoined,
      dateLeft: s.dateLeft ?? null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archivedAt: s.archivedAt ?? null,
    };
  },
  fromRow(row: WorkerRow): Worker {
    const snapshot: WorkerSnapshot = {
      id: asWorkerId(row.id),
      organizationId: row.organizationId as WorkerSnapshot["organizationId"],
      employeeNumber: row.employeeNumber,
      firstName: row.firstName,
      lastName: row.lastName,
      preferredName: row.preferredName ?? null,
      email: row.email,
      phone: row.phone ?? null,
      status: row.status as WorkerSnapshot["status"],
      employmentType: row.employmentType as WorkerSnapshot["employmentType"],
      positionId: row.positionId ? (row.positionId as WorkerSnapshot["positionId"]) : null,
      departmentId: row.departmentId as WorkerSnapshot["departmentId"],
      teamId: row.teamId ? (row.teamId as WorkerSnapshot["teamId"]) : null,
      managerId: row.managerId ? asWorkerId(row.managerId) : null,
      dateJoined: new Date(row.dateJoined),
      dateLeft: row.dateLeft ? new Date(row.dateLeft) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
    };
    return Worker.reconstitute(snapshot);
  },
};

export const EmploymentMapper = {
  toRow(employment: Employment): EmploymentRow {
    const s = employment.toSnapshot();
    return {
      id: s.id,
      workerId: s.workerId,
      organizationId: s.organizationId,
      employmentType: s.employmentType,
      startDate: s.startDate,
      endDate: s.endDate ?? null,
      status: s.status,
      workingHoursPerWeek: s.workingHoursPerWeek,
      probationDays: s.probationDays,
      probationActive: s.probationActive,
      noticePeriodDays: s.noticePeriodDays,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: EmploymentRow): Employment {
    const snapshot: EmploymentSnapshot = {
      id: asEmploymentId(row.id),
      workerId: asWorkerId(row.workerId),
      organizationId: row.organizationId as EmploymentSnapshot["organizationId"],
      employmentType: row.employmentType as EmploymentSnapshot["employmentType"],
      startDate: new Date(row.startDate),
      endDate: row.endDate ? new Date(row.endDate) : null,
      status: row.status as EmploymentSnapshot["status"],
      workingHoursPerWeek: row.workingHoursPerWeek,
      probationDays: row.probationDays,
      probationActive: row.probationActive,
      noticePeriodDays: row.noticePeriodDays,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Employment.reconstitute(snapshot);
  },
};

export const EmploymentContractMapper = {
  toRow(contract: EmploymentContract): ContractRow {
    const s = contract.toSnapshot();
    return {
      id: s.id,
      employmentId: s.employmentId,
      organizationId: s.organizationId,
      contractType: s.contractType,
      effectiveDate: s.effectiveDate,
      expiryDate: s.expiryDate ?? null,
      noticePeriodDays: s.noticePeriodDays,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: ContractRow): EmploymentContract {
    const snapshot: EmploymentContractSnapshot = {
      id: asEmploymentContractId(row.id),
      employmentId: asEmploymentId(row.employmentId),
      organizationId: row.organizationId as EmploymentContractSnapshot["organizationId"],
      contractType: row.contractType as EmploymentContractSnapshot["contractType"],
      effectiveDate: new Date(row.effectiveDate),
      expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
      noticePeriodDays: row.noticePeriodDays,
      status: row.status as EmploymentContractSnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return EmploymentContract.reconstitute(snapshot);
  },
};

export const ReportingRelationshipMapper = {
  toRow(relationship: ReportingRelationship): ReportingRow {
    const s = relationship.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      workerId: s.workerId,
      managerId: s.managerId,
      effectiveDate: s.effectiveDate,
      endDate: s.endDate ?? null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: ReportingRow): ReportingRelationship {
    const snapshot: ReportingRelationshipSnapshot = {
      id: asReportingRelationshipId(row.id),
      organizationId: row.organizationId as ReportingRelationshipSnapshot["organizationId"],
      workerId: asWorkerId(row.workerId),
      managerId: asWorkerId(row.managerId),
      effectiveDate: new Date(row.effectiveDate),
      endDate: row.endDate ? new Date(row.endDate) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return ReportingRelationship.reconstitute(snapshot);
  },
};
