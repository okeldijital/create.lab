import type { OrganizationRepository, Organization, OrganizationId, OrganizationSlug } from "@creative-lab/organization";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { organizations } from "./schema.js";
import { OrganizationMapper } from "./mappers.js";

export class PostgresOrganizationRepository implements OrganizationRepository {
  public constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: OrganizationId): Promise<Organization | null> {
    const rows = await this.db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return rows[0] ? OrganizationMapper.fromRow(rows[0]) : null;
  }

  async findBySlug(slug: OrganizationSlug | string): Promise<Organization | null> {
    const value = typeof slug === "string" ? slug : slug.value;
    const rows = await this.db.select().from(organizations).where(eq(organizations.slug, value)).limit(1);
    return rows[0] ? OrganizationMapper.fromRow(rows[0]) : null;
  }

  async findAll(): Promise<Organization[]> {
    const rows = await this.db.select().from(organizations);
    return rows.map(OrganizationMapper.fromRow);
  }

  async save(organization: Organization): Promise<void> {
    await this.db.insert(organizations).values(OrganizationMapper.toRow(organization));
  }

  async update(organization: Organization): Promise<void> {
    const row = OrganizationMapper.toRow(organization);
    await this.db.update(organizations).set(row).where(eq(organizations.id, organization.id));
  }

  async archive(id: OrganizationId): Promise<void> {
    const archivedAt = new Date();
    await this.db.update(organizations).set({ status: "ARCHIVED", archivedAt, updatedAt: archivedAt }).where(eq(organizations.id, id));
  }

  async exists(id: OrganizationId): Promise<boolean> {
    const rows = await this.db.select({ id: organizations.id }).from(organizations).where(eq(organizations.id, id)).limit(1);
    return rows.length > 0;
  }

  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    const value = typeof slug === "string" ? slug : slug.value;
    const rows = await this.db.select({ id: organizations.id }).from(organizations).where(eq(organizations.slug, value)).limit(1);
    return rows.length > 0;
  }

  async delete(id: OrganizationId): Promise<void> {
    await this.db.delete(organizations).where(eq(organizations.id, id));
  }
}
