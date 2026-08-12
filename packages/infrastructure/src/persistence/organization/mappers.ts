import {
  Department,
  Organization,
  OrganizationSettings,
  Studio,
  Team,
  type DepartmentSnapshot,
  type OrganizationSettingsSnapshot,
  type OrganizationSnapshot,
  type StudioSnapshot,
  type TeamSnapshot,
} from "@creative-lab/organization";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  departments,
  organizationSettings,
  organizations,
  studios,
  teams,
} from "./schema.js";

type OrganizationRow = InferSelectModel<typeof organizations>;
type DepartmentRow = InferSelectModel<typeof departments>;
type TeamRow = InferSelectModel<typeof teams>;
type StudioRow = InferSelectModel<typeof studios>;
type OrganizationSettingsRow = InferSelectModel<typeof organizationSettings>;

export type OrganizationInsert = InferInsertModel<typeof organizations>;
export type DepartmentInsert = InferInsertModel<typeof departments>;
export type TeamInsert = InferInsertModel<typeof teams>;
export type StudioInsert = InferInsertModel<typeof studios>;
export type OrganizationSettingsInsert = InferInsertModel<typeof organizationSettings>;

export const OrganizationMapper = {
  toRow(aggregate: Organization): OrganizationInsert {
    const snapshot = aggregate.toSnapshot();
    return {
      id: snapshot.id,
      name: snapshot.name,
      displayName: snapshot.displayName,
      legalName: snapshot.legalName,
      slug: snapshot.slug,
      description: snapshot.description,
      timezone: snapshot.timezone,
      locale: snapshot.locale,
      currency: snapshot.currency,
      status: snapshot.status,
      branding: snapshot.branding,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      archivedAt: snapshot.archivedAt,
    };
  },
  fromRow(row: OrganizationRow): Organization {
    const snapshot: OrganizationSnapshot = {
      id: row.id,
      name: row.name,
      displayName: row.displayName,
      legalName: row.legalName,
      slug: row.slug,
      description: row.description,
      timezone: row.timezone,
      locale: row.locale,
      currency: row.currency,
      status: row.status as OrganizationSnapshot["status"],
      branding: row.branding,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt,
    };
    return Organization.reconstitute(snapshot);
  },
};

export const DepartmentMapper = {
  toRow(aggregate: Department): DepartmentInsert {
    const snapshot = aggregate.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      name: snapshot.name,
      description: snapshot.description,
      parentDepartmentId: snapshot.parentDepartmentId,
      headId: snapshot.headId,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: DepartmentRow): Department {
    const snapshot: DepartmentSnapshot = {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      description: row.description,
      parentDepartmentId: row.parentDepartmentId,
      headId: row.headId,
      status: row.status as DepartmentSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Department.reconstitute(snapshot);
  },
};

export const TeamMapper = {
  toRow(aggregate: Team): TeamInsert {
    const snapshot = aggregate.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      departmentId: snapshot.departmentId,
      name: snapshot.name,
      description: snapshot.description,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: TeamRow): Team {
    const snapshot: TeamSnapshot = {
      id: row.id,
      organizationId: row.organizationId,
      departmentId: row.departmentId,
      name: row.name,
      description: row.description,
      status: row.status as TeamSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Team.reconstitute(snapshot);
  },
};

export const StudioMapper = {
  toRow(aggregate: Studio): StudioInsert {
    const snapshot = aggregate.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      name: snapshot.name,
      description: snapshot.description,
      type: snapshot.type,
      capacity: snapshot.capacity,
      location: snapshot.location,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: StudioRow): Studio {
    const snapshot: StudioSnapshot = {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      description: row.description,
      type: row.type as StudioSnapshot["type"],
      capacity: row.capacity,
      location: row.location,
      status: row.status as StudioSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Studio.reconstitute(snapshot);
  },
};

export const OrganizationSettingsMapper = {
  toRow(aggregate: OrganizationSettings): OrganizationSettingsInsert {
    const snapshot = aggregate.toSnapshot();
    return {
      organizationId: snapshot.organizationId,
      timezone: snapshot.timezone,
      locale: snapshot.locale,
      currency: snapshot.currency,
      workingWeek: [...snapshot.workingWeek],
      workingHours: snapshot.workingHours,
      branding: snapshot.branding,
      policies: snapshot.policies,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: OrganizationSettingsRow): OrganizationSettings {
    const snapshot: OrganizationSettingsSnapshot = {
      organizationId: row.organizationId,
      timezone: row.timezone,
      locale: row.locale,
      currency: row.currency,
      workingWeek: row.workingWeek,
      workingHours: row.workingHours,
      branding: row.branding,
      policies: row.policies,
      updatedAt: row.updatedAt,
    };
    return OrganizationSettings.reconstitute(snapshot);
  },
};
