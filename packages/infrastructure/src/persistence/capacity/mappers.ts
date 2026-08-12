import {
  AvailabilityProfile,
  type AvailabilityProfileSnapshot,
  Capability,
  type CapabilitySnapshot,
  CapacityProfile,
  type CapacityProfileSnapshot,
  ResourceCapacity,
  type ResourceCapacitySnapshot,
  WorkingPattern,
  type WorkingPatternSnapshot,
  asAvailabilityProfileId,
  asCapabilityId,
  asCapacityProfileId,
  asResourceCapacityId,
  asResourceId,
  asWorkingPatternId,
} from "@creative-lab/capacity";
import type { InferSelectModel } from "drizzle-orm";
import type { availabilityProfiles, capabilities, capacityProfiles, resourceCapacities, workingPatterns } from "./schema.js";

type CapacityProfileRow = InferSelectModel<typeof capacityProfiles>;
type CapabilityRow = InferSelectModel<typeof capabilities>;
type AvailabilityProfileRow = InferSelectModel<typeof availabilityProfiles>;
type WorkingPatternRow = InferSelectModel<typeof workingPatterns>;
type ResourceCapacityRow = InferSelectModel<typeof resourceCapacities>;

export const CapacityProfileMapper = {
  toRow(value: CapacityProfile): CapacityProfileRow {
    const s = value.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, resourceId: s.resourceId, resourceType: s.resourceType, availabilityProfileId: s.availabilityProfileId ?? null, workingPatternId: s.workingPatternId ?? null, status: s.status, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo ?? null, createdAt: s.createdAt, updatedAt: s.updatedAt };
  },
  fromRow(row: CapacityProfileRow): CapacityProfile {
    const snapshot: CapacityProfileSnapshot = { id: asCapacityProfileId(row.id), organizationId: row.organizationId as CapacityProfileSnapshot["organizationId"], resourceId: asResourceId(row.resourceId), resourceType: row.resourceType as CapacityProfileSnapshot["resourceType"], availabilityProfileId: row.availabilityProfileId ? asAvailabilityProfileId(row.availabilityProfileId) : null, workingPatternId: row.workingPatternId ? asWorkingPatternId(row.workingPatternId) : null, status: row.status as CapacityProfileSnapshot["status"], effectiveFrom: new Date(row.effectiveFrom), effectiveTo: row.effectiveTo ? new Date(row.effectiveTo) : null, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
    return CapacityProfile.reconstitute(snapshot);
  },
};

export const CapabilityMapper = {
  toRow(value: Capability): CapabilityRow {
    const s = value.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, capacityProfileId: s.capacityProfileId, name: s.name, proficiency: s.proficiency, certification: s.certification ?? null, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo ?? null, active: s.active, createdAt: s.createdAt, updatedAt: s.updatedAt };
  },
  fromRow(row: CapabilityRow): Capability {
    const snapshot: CapabilitySnapshot = { id: asCapabilityId(row.id), organizationId: row.organizationId as CapabilitySnapshot["organizationId"], capacityProfileId: asCapacityProfileId(row.capacityProfileId), name: row.name, proficiency: row.proficiency as CapabilitySnapshot["proficiency"], certification: row.certification ?? null, effectiveFrom: new Date(row.effectiveFrom), effectiveTo: row.effectiveTo ? new Date(row.effectiveTo) : null, active: row.active, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
    return Capability.reconstitute(snapshot);
  },
};

export const AvailabilityProfileMapper = {
  toRow(value: AvailabilityProfile): AvailabilityProfileRow {
    const s = value.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, name: s.name, timezone: s.timezone, workingDays: s.workingDays, workingHoursStart: s.workingHoursStart, workingHoursEnd: s.workingHoursEnd, exceptions: s.exceptions, createdAt: s.createdAt, updatedAt: s.updatedAt };
  },
  fromRow(row: AvailabilityProfileRow): AvailabilityProfile {
    const snapshot: AvailabilityProfileSnapshot = { id: asAvailabilityProfileId(row.id), organizationId: row.organizationId as AvailabilityProfileSnapshot["organizationId"], name: row.name, timezone: row.timezone, workingDays: row.workingDays as AvailabilityProfileSnapshot["workingDays"], workingHoursStart: row.workingHoursStart, workingHoursEnd: row.workingHoursEnd, exceptions: row.exceptions as AvailabilityProfileSnapshot["exceptions"], createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
    return AvailabilityProfile.reconstitute(snapshot);
  },
};

export const WorkingPatternMapper = {
  toRow(value: WorkingPattern): WorkingPatternRow {
    const s = value.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, hoursPerWeek: String(s.hoursPerWeek), hoursPerDay: String(s.hoursPerDay), daysPerWeek: String(s.daysPerWeek), overtimeAllowed: s.overtimeAllowed, remoteAllowed: s.remoteAllowed, createdAt: s.createdAt, updatedAt: s.updatedAt };
  },
  fromRow(row: WorkingPatternRow): WorkingPattern {
    const snapshot: WorkingPatternSnapshot = { id: asWorkingPatternId(row.id), organizationId: row.organizationId as WorkingPatternSnapshot["organizationId"], hoursPerWeek: Number(row.hoursPerWeek), hoursPerDay: Number(row.hoursPerDay), daysPerWeek: Number(row.daysPerWeek), overtimeAllowed: row.overtimeAllowed, remoteAllowed: row.remoteAllowed, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
    return WorkingPattern.reconstitute(snapshot);
  },
};

export const ResourceCapacityMapper = {
  toRow(value: ResourceCapacity): ResourceCapacityRow {
    const s = value.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, capacityProfileId: s.capacityProfileId, capacityType: s.capacityType, quantity: String(s.quantity), unit: s.unit, effectiveFrom: s.effectiveFrom, effectiveTo: s.effectiveTo ?? null, createdAt: s.createdAt, updatedAt: s.updatedAt };
  },
  fromRow(row: ResourceCapacityRow): ResourceCapacity {
    const snapshot: ResourceCapacitySnapshot = { id: asResourceCapacityId(row.id), organizationId: row.organizationId as ResourceCapacitySnapshot["organizationId"], capacityProfileId: asCapacityProfileId(row.capacityProfileId), capacityType: row.capacityType, quantity: Number(row.quantity), unit: row.unit as ResourceCapacitySnapshot["unit"], effectiveFrom: new Date(row.effectiveFrom), effectiveTo: row.effectiveTo ? new Date(row.effectiveTo) : null, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
    return ResourceCapacity.reconstitute(snapshot);
  },
};
