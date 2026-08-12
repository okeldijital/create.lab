import type { StudioRepository, Studio, StudioId, OrganizationId } from "@creative-lab/organization";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { studios } from "./schema.js";
import { StudioMapper } from "./mappers.js";

export class PostgresStudioRepository implements StudioRepository {
  public constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: StudioId): Promise<Studio | null> {
    const rows = await this.db.select().from(studios).where(eq(studios.id, id)).limit(1);
    return rows[0] ? StudioMapper.fromRow(rows[0]) : null;
  }

  async findByOrganizationId(organizationId: OrganizationId): Promise<Studio[]> {
    const rows = await this.db.select().from(studios).where(eq(studios.organizationId, organizationId));
    return rows.map(StudioMapper.fromRow);
  }

  async findByNameInOrganization(organizationId: OrganizationId, name: string): Promise<Studio | null> {
    const rows = await this.db.select().from(studios).where(and(eq(studios.organizationId, organizationId), eq(studios.name, name))).limit(1);
    return rows[0] ? StudioMapper.fromRow(rows[0]) : null;
  }

  async findAll(): Promise<Studio[]> {
    const rows = await this.db.select().from(studios);
    return rows.map(StudioMapper.fromRow);
  }

  async save(studio: Studio): Promise<void> {
    await this.db.insert(studios).values(StudioMapper.toRow(studio));
  }

  async update(studio: Studio): Promise<void> {
    const row = StudioMapper.toRow(studio);
    await this.db.update(studios).set(row).where(eq(studios.id, studio.id));
  }

  async archive(id: StudioId): Promise<void> {
    await this.db.update(studios).set({ status: "ARCHIVED", updatedAt: new Date() }).where(eq(studios.id, id));
  }

  async exists(id: StudioId): Promise<boolean> {
    const rows = await this.db.select({ id: studios.id }).from(studios).where(eq(studios.id, id)).limit(1);
    return rows.length > 0;
  }

  async existsByNameInOrganization(organizationId: OrganizationId, name: string): Promise<boolean> {
    const rows = await this.db.select({ id: studios.id }).from(studios).where(and(eq(studios.organizationId, organizationId), eq(studios.name, name))).limit(1);
    return rows.length > 0;
  }

  async delete(id: StudioId): Promise<void> {
    await this.db.delete(studios).where(eq(studios.id, id));
  }
}
