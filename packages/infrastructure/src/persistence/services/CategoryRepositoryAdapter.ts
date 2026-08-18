import type { OrganizationId } from "@creative-lab/organization";
import type { ServiceCategory, ServiceCategoryId, CategoryRepository } from "@creative-lab/services";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { serviceCategories } from "./schema.js";
import { ServiceCategoryMapper } from "./mappers.js";

export class PostgresCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ServiceCategoryId): Promise<ServiceCategory | null> {
    const rows = await this.db.select().from(serviceCategories).where(eq(serviceCategories.id, id)).limit(1);
    return rows[0] ? ServiceCategoryMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<ServiceCategory[]> {
    const rows = await this.db.select().from(serviceCategories).where(eq(serviceCategories.organizationId, organizationId));
    return rows.map(ServiceCategoryMapper.fromRow);
  }

  async findByName(organizationId: OrganizationId, name: string): Promise<ServiceCategory | null> {
    const rows = await this.db.select().from(serviceCategories).where(and(eq(serviceCategories.organizationId, organizationId), eq(serviceCategories.name, name))).limit(1);
    return rows[0] ? ServiceCategoryMapper.fromRow(rows[0]) : null;
  }

  async save(category: ServiceCategory): Promise<void> {
    await this.db.insert(serviceCategories).values(ServiceCategoryMapper.toRow(category));
  }

  async update(category: ServiceCategory): Promise<void> {
    await this.db.update(serviceCategories).set(ServiceCategoryMapper.toRow(category)).where(eq(serviceCategories.id, category.id));
  }

  async archive(id: ServiceCategoryId): Promise<void> {
    const now = new Date();
    await this.db.update(serviceCategories).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(serviceCategories.id, id));
  }

  async exists(id: ServiceCategoryId): Promise<boolean> {
    const rows = await this.db.select({ id: serviceCategories.id }).from(serviceCategories).where(eq(serviceCategories.id, id)).limit(1);
    return rows.length > 0;
  }
}
