import type { DepartmentRepository, Department, DepartmentId, OrganizationId } from "@creative-lab/organization";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { departments } from "./schema.js";
import { DepartmentMapper } from "./mappers.js";

export class PostgresDepartmentRepository implements DepartmentRepository {
  public constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: DepartmentId): Promise<Department | null> {
    const rows = await this.db.select().from(departments).where(eq(departments.id, id)).limit(1);
    return rows[0] ? DepartmentMapper.fromRow(rows[0]) : null;
  }

  async findByOrganizationId(organizationId: OrganizationId): Promise<Department[]> {
    const rows = await this.db.select().from(departments).where(eq(departments.organizationId, organizationId));
    return rows.map(DepartmentMapper.fromRow);
  }

  async findByNameInOrganization(organizationId: OrganizationId, name: string): Promise<Department | null> {
    const rows = await this.db.select().from(departments).where(and(eq(departments.organizationId, organizationId), eq(departments.name, name))).limit(1);
    return rows[0] ? DepartmentMapper.fromRow(rows[0]) : null;
  }

  async findAll(): Promise<Department[]> {
    const rows = await this.db.select().from(departments);
    return rows.map(DepartmentMapper.fromRow);
  }

  async save(department: Department): Promise<void> {
    await this.db.insert(departments).values(DepartmentMapper.toRow(department));
  }

  async update(department: Department): Promise<void> {
    const row = DepartmentMapper.toRow(department);
    await this.db.update(departments).set(row).where(eq(departments.id, department.id));
  }

  async archive(id: DepartmentId): Promise<void> {
    await this.db.update(departments).set({ status: "INACTIVE", updatedAt: new Date() }).where(eq(departments.id, id));
  }

  async exists(id: DepartmentId): Promise<boolean> {
    const rows = await this.db.select({ id: departments.id }).from(departments).where(eq(departments.id, id)).limit(1);
    return rows.length > 0;
  }

  async existsByNameInOrganization(organizationId: OrganizationId, name: string): Promise<boolean> {
    const rows = await this.db.select({ id: departments.id }).from(departments).where(and(eq(departments.organizationId, organizationId), eq(departments.name, name))).limit(1);
    return rows.length > 0;
  }

  async delete(id: DepartmentId): Promise<void> {
    await this.db.delete(departments).where(eq(departments.id, id));
  }
}
