import type { OrganizationId } from "@creative-lab/organization";
import type { CapacityProfile, CapacityProfileId, CapacityProfileRepository, ResourceId } from "@creative-lab/capacity";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { capacityProfiles } from "./schema.js";
import { CapacityProfileMapper } from "./mappers.js";

export class PostgresCapacityProfileRepository implements CapacityProfileRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: CapacityProfileId): Promise<CapacityProfile | null> {
    const rows = await this.db.select().from(capacityProfiles).where(eq(capacityProfiles.id, id)).limit(1);
    return rows[0] ? CapacityProfileMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<CapacityProfile[]> {
    const rows = await this.db.select().from(capacityProfiles).where(eq(capacityProfiles.organizationId, organizationId));
    return rows.map(CapacityProfileMapper.fromRow);
  }

  async findByResource(resourceId: ResourceId): Promise<CapacityProfile[]> {
    const rows = await this.db.select().from(capacityProfiles).where(eq(capacityProfiles.resourceId, resourceId));
    return rows.map(CapacityProfileMapper.fromRow);
  }

  async findActiveByResource(resourceId: ResourceId): Promise<CapacityProfile | null> {
    const rows = await this.db.select().from(capacityProfiles).where(and(eq(capacityProfiles.resourceId, resourceId), eq(capacityProfiles.status, "ACTIVE"))).limit(1);
    return rows[0] ? CapacityProfileMapper.fromRow(rows[0]) : null;
  }

  async findAll(): Promise<CapacityProfile[]> {
    const rows = await this.db.select().from(capacityProfiles);
    return rows.map(CapacityProfileMapper.fromRow);
  }

  async save(profile: CapacityProfile): Promise<void> {
    await this.db.insert(capacityProfiles).values(CapacityProfileMapper.toRow(profile));
  }

  async update(profile: CapacityProfile): Promise<void> {
    await this.db.update(capacityProfiles).set(CapacityProfileMapper.toRow(profile)).where(eq(capacityProfiles.id, profile.id));
  }

  async archive(id: CapacityProfileId): Promise<void> {
    const now = new Date();
    await this.db.update(capacityProfiles).set({ status: "ARCHIVED", updatedAt: now }).where(eq(capacityProfiles.id, id));
  }

  async exists(id: CapacityProfileId): Promise<boolean> {
    const rows = await this.db.select({ id: capacityProfiles.id }).from(capacityProfiles).where(eq(capacityProfiles.id, id)).limit(1);
    return rows.length > 0;
  }
}
