import type { OrganizationId } from "@creative-lab/organization";
import type { AvailabilityProfile, AvailabilityProfileId, AvailabilityProfileRepository } from "@creative-lab/capacity";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { availabilityProfiles } from "./schema.js";
import { AvailabilityProfileMapper } from "./mappers.js";

export class PostgresAvailabilityProfileRepository implements AvailabilityProfileRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: AvailabilityProfileId): Promise<AvailabilityProfile | null> {
    const rows = await this.db.select().from(availabilityProfiles).where(eq(availabilityProfiles.id, id)).limit(1);
    return rows[0] ? AvailabilityProfileMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<AvailabilityProfile[]> {
    const rows = await this.db.select().from(availabilityProfiles).where(eq(availabilityProfiles.organizationId, organizationId));
    return rows.map(AvailabilityProfileMapper.fromRow);
  }

  async findAll(): Promise<AvailabilityProfile[]> {
    const rows = await this.db.select().from(availabilityProfiles);
    return rows.map(AvailabilityProfileMapper.fromRow);
  }

  async save(profile: AvailabilityProfile): Promise<void> {
    await this.db.insert(availabilityProfiles).values(AvailabilityProfileMapper.toRow(profile));
  }

  async update(profile: AvailabilityProfile): Promise<void> {
    await this.db.update(availabilityProfiles).set(AvailabilityProfileMapper.toRow(profile)).where(eq(availabilityProfiles.id, profile.id));
  }

  async archive(id: AvailabilityProfileId): Promise<void> {
    await this.db.delete(availabilityProfiles).where(eq(availabilityProfiles.id, id));
  }

  async exists(id: AvailabilityProfileId): Promise<boolean> {
    const rows = await this.db.select({ id: availabilityProfiles.id }).from(availabilityProfiles).where(eq(availabilityProfiles.id, id)).limit(1);
    return rows.length > 0;
  }
}
