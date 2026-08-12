import type { OrganizationId } from "@creative-lab/organization";
import type { Capability, CapabilityId, CapabilityRepository, CapacityProfileId } from "@creative-lab/capacity";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { capabilities } from "./schema.js";
import { CapabilityMapper } from "./mappers.js";

export class PostgresCapabilityRepository implements CapabilityRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: CapabilityId): Promise<Capability | null> {
    const rows = await this.db.select().from(capabilities).where(eq(capabilities.id, id)).limit(1);
    return rows[0] ? CapabilityMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Capability[]> {
    const rows = await this.db.select().from(capabilities).where(eq(capabilities.organizationId, organizationId));
    return rows.map(CapabilityMapper.fromRow);
  }

  async findByCapacityProfile(capacityProfileId: CapacityProfileId): Promise<Capability[]> {
    const rows = await this.db.select().from(capabilities).where(eq(capabilities.capacityProfileId, capacityProfileId));
    return rows.map(CapabilityMapper.fromRow);
  }

  async findActiveByProfileAndName(capacityProfileId: CapacityProfileId, name: string): Promise<Capability | null> {
    const rows = await this.db.select().from(capabilities).where(and(eq(capabilities.capacityProfileId, capacityProfileId), eq(capabilities.name, name), eq(capabilities.active, true))).limit(1);
    return rows[0] ? CapabilityMapper.fromRow(rows[0]) : null;
  }

  async findAll(): Promise<Capability[]> {
    const rows = await this.db.select().from(capabilities);
    return rows.map(CapabilityMapper.fromRow);
  }

  async save(capability: Capability): Promise<void> {
    await this.db.insert(capabilities).values(CapabilityMapper.toRow(capability));
  }

  async update(capability: Capability): Promise<void> {
    await this.db.update(capabilities).set(CapabilityMapper.toRow(capability)).where(eq(capabilities.id, capability.id));
  }

  async archive(id: CapabilityId): Promise<void> {
    const now = new Date();
    await this.db.update(capabilities).set({ active: false, effectiveTo: now.toISOString().slice(0, 10), updatedAt: now }).where(eq(capabilities.id, id));
  }

  async exists(id: CapabilityId): Promise<boolean> {
    const rows = await this.db.select({ id: capabilities.id }).from(capabilities).where(eq(capabilities.id, id)).limit(1);
    return rows.length > 0;
  }
}
