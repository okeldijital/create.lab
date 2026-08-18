import type { OrganizationId } from "@creative-lab/organization";
import type { Service, ServiceCategoryId, ServiceId, ServiceRepository, ServiceStatus } from "@creative-lab/services";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { services } from "./schema.js";
import { ServiceMapper } from "./mappers.js";

export class PostgresServiceRepository implements ServiceRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ServiceId): Promise<Service | null> {
    const rows = await this.db.select().from(services).where(eq(services.id, id)).limit(1);
    return rows[0] ? ServiceMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Service[]> {
    const rows = await this.db.select().from(services).where(eq(services.organizationId, organizationId));
    return rows.map(ServiceMapper.fromRow);
  }

  async findByServiceCode(organizationId: OrganizationId, serviceCode: string): Promise<Service | null> {
    const rows = await this.db.select().from(services).where(and(eq(services.organizationId, organizationId), eq(services.serviceCode, serviceCode))).limit(1);
    return rows[0] ? ServiceMapper.fromRow(rows[0]) : null;
  }

  async findByCategory(categoryId: ServiceCategoryId): Promise<Service[]> {
    const rows = await this.db.select().from(services).where(eq(services.categoryId, categoryId));
    return rows.map(ServiceMapper.fromRow);
  }

  async findByStatus(status: ServiceStatus): Promise<Service[]> {
    const rows = await this.db.select().from(services).where(eq(services.status, status));
    return rows.map(ServiceMapper.fromRow);
  }

  async save(service: Service): Promise<void> {
    await this.db.insert(services).values(ServiceMapper.toRow(service));
  }

  async update(service: Service): Promise<void> {
    await this.db.update(services).set(ServiceMapper.toRow(service)).where(eq(services.id, service.id));
  }

  async archive(id: ServiceId): Promise<void> {
    const now = new Date();
    await this.db.update(services).set({ status: "ARCHIVED", archivedAt: now, updatedAt: now }).where(eq(services.id, id));
  }

  async exists(id: ServiceId): Promise<boolean> {
    const rows = await this.db.select({ id: services.id }).from(services).where(eq(services.id, id)).limit(1);
    return rows.length > 0;
  }
}
