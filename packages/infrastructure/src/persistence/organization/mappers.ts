import {
  Department,
  Organization,
  OrganizationSettings,
  Studio,
  Team,
  asDepartmentId,
  asOrganizationId,
  asStudioId,
  asTeamId,
  type DepartmentSnapshot,
  type OrganizationSettingsSnapshot,
  type OrganizationSnapshot,
  type StudioSnapshot,
  type TeamSnapshot,
} from "@creative-lab/organization";
import type { InferSelectModel } from "drizzle-orm";
import type {
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

export type OrganizationInsert = OrganizationRow;
export type DepartmentInsert = DepartmentRow;
export type TeamInsert = TeamRow;
export type StudioInsert = StudioRow;
export type OrganizationSettingsInsert = OrganizationSettingsRow;
export const OrganizationMapper = {
  toRow(aggregate: Organization): OrganizationRow {
    const snapshot = aggregate.toSnapshot();
    return {
      id: snapshot.id,
      name: snapshot.name,
      displayName: snapshot.displayName,
      legalName: snapshot.legalName,
      slug: snapshot.slug,
      description: snapshot.description ?? null,
      timezone: snapshot.timezone,
      locale: snapshot.locale,
      currency: snapshot.currency,
      status: snapshot.status,
      branding: snapshot.branding ?? {},
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      archivedAt: snapshot.archivedAt ?? null,
    };
  },
  fromRow(row: OrganizationRow): Organization {
    const snapshot: OrganizationSnapshot = {
      id: asOrganizationId(row.id),
      name: row.name,
      displayName: row.displayName,
      legalName: row.legalName,
      slug: row.slug,
      description: row.description ?? null,
      timezone: row.timezone,
      locale: row.locale,
      currency: row.currency,
      status: row.status as OrganizationSnapshot["status"],
      branding: row.branding ?? {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt ?? null,
    };
    return Organization.reconstitute(snapshot);
  },
};

export const DepartmentMapper = {
  toRow(aggregate: Department): DepartmentRow {
    const snapshot = aggregate.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      name: snapshot.name,
      description: snapshot.description ?? null,
      parentDepartmentId: snapshot.parentDepartmentId ?? null,
      headId: snapshot.headId ?? null,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: DepartmentRow): Department {
    const snapshot: DepartmentSnapshot = {
      id: asDepartmentId(row.id),
      organizationId: asOrganizationId(row.organizationId),
      name: row.name,
      description: row.description ?? null,
      parentDepartmentId: row.parentDepartmentId
        ? asDepartmentId(row.parentDepartmentId)
        : null,
      headId: row.headId ?? null,
      status: row.status as DepartmentSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Department.reconstitute(snapshot);
  },
};

export const TeamMapper = {
  toRow(aggregate: Team): TeamRow {
    const snapshot = aggregate.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      departmentId: snapshot.departmentId,
      name: snapshot.name,
      description: snapshot.description ?? null,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: TeamRow): Team {
    const snapshot: TeamSnapshot = {
      id: asTeamId(row.id),
      organizationId: asOrganizationId(row.organizationId),
      departmentId: asDepartmentId(row.departmentId),
      name: row.name,
      description: row.description ?? null,
      status: row.status as TeamSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Team.reconstitute(snapshot);
  },
};

export const StudioMapper = {
  toRow(aggregate: Studio): StudioRow {
    const snapshot = aggregate.toSnapshot();
    return {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      name: snapshot.name,
      description: snapshot.description ?? null,
      type: snapshot.type,
      capacity: snapshot.capacity,
      location: snapshot.location ?? null,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: StudioRow): Studio {
    const snapshot: StudioSnapshot = {
      id: asStudioId(row.id),
      organizationId: asOrganizationId(row.organizationId),
      name: row.name,
      description: row.description ?? null,
      type: row.type as StudioSnapshot["type"],
      capacity: row.capacity,
      location: row.location ?? null,
      status: row.status as StudioSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Studio.reconstitute(snapshot);
  },
};

export const OrganizationSettingsMapper = {
  toRow(aggregate: OrganizationSettings): OrganizationSettingsRow {
    const snapshot = aggregate.toSnapshot();
    return {
      organizationId: snapshot.organizationId,
      timezone: snapshot.timezone,
      locale: snapshot.locale,
      currency: snapshot.currency,
      workingWeek: [...snapshot.workingWeek],
      workingHours: {
        start: snapshot.workingHours.start,
        end: snapshot.workingHours.end,
      },
      branding: snapshot.branding ?? {},
      policies: snapshot.policies ?? {},
      updatedAt: snapshot.updatedAt,
    };
  },
  fromRow(row: OrganizationSettingsRow): OrganizationSettings {
    const snapshot: OrganizationSettingsSnapshot = {
      organizationId: asOrganizationId(row.organizationId),
      timezone: row.timezone,
      locale: row.locale,
      currency: row.currency,
      workingWeek: row.workingWeek,
      workingHours: row.workingHours,
      branding: row.branding ?? {},
      policies: row.policies ?? {},
      updatedAt: row.updatedAt,
    };
    return OrganizationSettings.reconstitute(snapshot);
  },
};
