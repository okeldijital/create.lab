import type { OrganizationId } from "@creative-lab/organization";
import type { Worker, WorkerId, WorkerRepository } from "@creative-lab/workforce";
import { WorkerStatus } from "@creative-lab/workforce";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { workers } from "./schema.js";
import { WorkerMapper } from "./mappers.js";

export class PostgresWorkerRepository implements WorkerRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: WorkerId): Promise<Worker | null> {
    const rows = await this.db.select().from(workers).where(eq(workers.id, id)).limit(1);
    return rows[0] ? WorkerMapper.fromRow(rows[0]) : null;
  }
  async findAll(): Promise<Worker[]> {
    const rows = await this.db.select().from(workers);
    return rows.map(WorkerMapper.fromRow);
  }
  async findByOrganization(organizationId: OrganizationId): Promise<Worker[]> {
    const rows = await this.db.select().from(workers).where(eq(workers.organizationId, organizationId));
    return rows.map(WorkerMapper.fromRow);
  }
  async findByEmail(organizationId: OrganizationId, email: string): Promise<Worker | null> {
    const rows = await this.db.select().from(workers).where(and(eq(workers.organizationId, organizationId), eq(workers.email, email))).limit(1);
    return rows[0] ? WorkerMapper.fromRow(rows[0]) : null;
  }
  async findByEmployeeNumber(organizationId: OrganizationId, employeeNumber: string): Promise<Worker | null> {
    const rows = await this.db.select().from(workers).where(and(eq(workers.organizationId, organizationId), eq(workers.employeeNumber, employeeNumber))).limit(1);
    return rows[0] ? WorkerMapper.fromRow(rows[0]) : null;
  }
  async save(worker: Worker): Promise<void> {
    await this.db.insert(workers).values(WorkerMapper.toRow(worker));
  }
  async update(worker: Worker): Promise<void> {
    await this.db.update(workers).set(WorkerMapper.toRow(worker)).where(eq(workers.id, worker.id));
  }
  async archive(id: WorkerId): Promise<void> {
    const now = new Date();
    await this.db.update(workers).set({ status: WorkerStatus.ARCHIVED, archivedAt: now, dateLeft: now, updatedAt: now }).where(eq(workers.id, id));
  }
  async exists(id: WorkerId): Promise<boolean> {
    const rows = await this.db.select({ id: workers.id }).from(workers).where(eq(workers.id, id)).limit(1);
    return rows.length > 0;
  }
  async existsByEmail(organizationId: OrganizationId, email: string): Promise<boolean> {
    const rows = await this.db.select({ id: workers.id }).from(workers).where(and(eq(workers.organizationId, organizationId), eq(workers.email, email))).limit(1);
    return rows.length > 0;
  }
  async existsByEmployeeNumber(organizationId: OrganizationId, employeeNumber: string): Promise<boolean> {
    const rows = await this.db.select({ id: workers.id }).from(workers).where(and(eq(workers.organizationId, organizationId), eq(workers.employeeNumber, employeeNumber))).limit(1);
    return rows.length > 0;
  }
  async delete(id: WorkerId): Promise<void> {
    await this.db.delete(workers).where(eq(workers.id, id));
  }
}
