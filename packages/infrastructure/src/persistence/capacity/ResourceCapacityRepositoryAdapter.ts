import type { OrganizationId } from "@creative-lab/organization";
import type { CapacityProfileId, ResourceCapacity, ResourceCapacityId, ResourceCapacityRepository } from "@creative-lab/capacity";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { resourceCapacities } from "./schema.js";
import { ResourceCapacityMapper } from "./mappers.js";

export class PostgresResourceCapacityRepository implements ResourceCapacityRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: ResourceCapacityId): Promise<ResourceCapacity | null> {
    const rows = await this.db.select().from(resourceCapacities).where(eq(resourceCapacities.id, id)).limit(1);
    return rows[0] ? ResourceCapacityMapper.fromRow(rows[0]) : null;
  }
  async findByOrganization(organizationId: OrganizationId): Promise<ResourceCapacity[]> {
    const rows = await this.db.select().from(resourceCapacities).where(eq(resourceCapacities.organizationId, organizationId));
    return rows.map(ResourceCapacityMapper.fromRow);
  }
  async findByCapacityProfile(capacityProfileId: CapacityProfileId): Promise<ResourceCapacity[]> {
    const rows = await this.db.select().from(resourceCapacities).where(eq(resourceCapacities.capacityProfileId, capacityProfileId));
    return rows.map(ResourceCapacityMapper.fromRow);
  }
  async findAll(): Promise<ResourceCapacity[]> {
    const rows = await this.db.select().from(resourceCapacities);
    return rows.map(ResourceCapacityMapper.fromRow);
  }
  async save(capacity: ResourceCapacity): Promise<void> {
    await this.db.insert(resourceCapacities).values(ResourceCapacityMapper.toRow(capacity));
  }
  async update(capacity: ResourceCapacity): Promise<void> {
    await this.db.update(resourceCapacities).set(ResourceCapacityMapper.toRow(capacity)).where(eq(resourceCapacities.id, capacity.id));
  }
  async archive(id: ResourceCapacityId): Promise<void> {
    const now = new Date();
    await this.db.update(resourceCapacities).set({ effectiveTo: now.toISOString().slice(0, 10), updatedAt: now }).where(eq(resourceCapacities.id, id));
  }
  async exists(id: ResourceCapacityId): Promise<boolean> {
    const rows = await this.db.select({ id: resourceCapacities.id }).from(resourceCapacities).where(eq(resourceCapacities.id, id)).limit(1);
    return rows.length > 0;
  }
}
