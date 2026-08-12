import type { OrganizationId } from "@creative-lab/organization";
import type { Employment, EmploymentId, EmploymentRepository, WorkerId } from "@creative-lab/workforce";
import { EmploymentStatus } from "@creative-lab/workforce";
import { and, eq, inArray } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { employments } from "./schema.js";
import { EmploymentMapper } from "./mappers.js";

export class PostgresEmploymentRepository implements EmploymentRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: EmploymentId): Promise<Employment | null> {
    const rows = await this.db.select().from(employments).where(eq(employments.id, id)).limit(1);
    return rows[0] ? EmploymentMapper.fromRow(rows[0]) : null;
  }
  async findAll(): Promise<Employment[]> {
    const rows = await this.db.select().from(employments);
    return rows.map(EmploymentMapper.fromRow);
  }
  async findByOrganization(organizationId: OrganizationId): Promise<Employment[]> {
    const rows = await this.db.select().from(employments).where(eq(employments.organizationId, organizationId));
    return rows.map(EmploymentMapper.fromRow);
  }
  async findByWorker(workerId: WorkerId): Promise<Employment[]> {
    const rows = await this.db.select().from(employments).where(eq(employments.workerId, workerId));
    return rows.map(EmploymentMapper.fromRow);
  }
  async findActiveByWorker(workerId: WorkerId): Promise<Employment | null> {
    const rows = await this.db.select().from(employments).where(and(eq(employments.workerId, workerId), inArray(employments.status, [EmploymentStatus.PROBATION, EmploymentStatus.ACTIVE]))).limit(1);
    return rows[0] ? EmploymentMapper.fromRow(rows[0]) : null;
  }
  async save(employment: Employment): Promise<void> {
    await this.db.insert(employments).values(EmploymentMapper.toRow(employment));
  }
  async update(employment: Employment): Promise<void> {
    await this.db.update(employments).set(EmploymentMapper.toRow(employment)).where(eq(employments.id, employment.id));
  }
  async archive(id: EmploymentId): Promise<void> {
    await this.db.delete(employments).where(eq(employments.id, id));
  }
  async exists(id: EmploymentId): Promise<boolean> {
    const rows = await this.db.select({ id: employments.id }).from(employments).where(eq(employments.id, id)).limit(1);
    return rows.length > 0;
  }
  async delete(id: EmploymentId): Promise<void> {
    await this.db.delete(employments).where(eq(employments.id, id));
  }
}
