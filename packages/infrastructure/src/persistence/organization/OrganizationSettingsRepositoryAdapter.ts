import type { OrganizationSettingsRepository, OrganizationSettings, OrganizationId } from "@creative-lab/organization";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { organizationSettings } from "./schema.js";
import { OrganizationSettingsMapper } from "./mappers.js";

export class PostgresOrganizationSettingsRepository implements OrganizationSettingsRepository {
  public constructor(private readonly db: DrizzleDatabase) {}

  async findByOrganizationId(organizationId: OrganizationId): Promise<OrganizationSettings | null> {
    const rows = await this.db.select().from(organizationSettings).where(eq(organizationSettings.organizationId, organizationId)).limit(1);
    return rows[0] ? OrganizationSettingsMapper.fromRow(rows[0]) : null;
  }

  async findById(organizationId: OrganizationId): Promise<OrganizationSettings | null> {
    return this.findByOrganizationId(organizationId);
  }

  async findAll(): Promise<OrganizationSettings[]> {
    const rows = await this.db.select().from(organizationSettings);
    return rows.map(OrganizationSettingsMapper.fromRow);
  }

  async save(settings: OrganizationSettings): Promise<void> {
    await this.db.insert(organizationSettings).values(OrganizationSettingsMapper.toRow(settings));
  }

  async update(settings: OrganizationSettings): Promise<void> {
    const row = OrganizationSettingsMapper.toRow(settings);
    await this.db.update(organizationSettings).set(row).where(eq(organizationSettings.organizationId, settings.organizationId));
  }

  async archive(organizationId: OrganizationId): Promise<void> {
    await this.db.delete(organizationSettings).where(eq(organizationSettings.organizationId, organizationId));
  }

  async exists(organizationId: OrganizationId): Promise<boolean> {
    const rows = await this.db.select({ organizationId: organizationSettings.organizationId }).from(organizationSettings).where(eq(organizationSettings.organizationId, organizationId)).limit(1);
    return rows.length > 0;
  }

  async delete(organizationId: OrganizationId): Promise<void> {
    await this.db.delete(organizationSettings).where(eq(organizationSettings.organizationId, organizationId));
  }
}
