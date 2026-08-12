import type { OrganizationId } from "@creative-lab/organization";
import type { WorkingPattern, WorkingPatternId, WorkingPatternRepository } from "@creative-lab/capacity";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { workingPatterns } from "./schema.js";
import { WorkingPatternMapper } from "./mappers.js";

export class PostgresWorkingPatternRepository implements WorkingPatternRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: WorkingPatternId): Promise<WorkingPattern | null> { const rows = await this.db.select().from(workingPatterns).where(eq(workingPatterns.id, id)).limit(1); return rows[0] ? WorkingPatternMapper.fromRow(rows[0]) : null; }
  async findByOrganization(organizationId: OrganizationId): Promise<WorkingPattern[]> { const rows = await this.db.select().from(workingPatterns).where(eq(workingPatterns.organizationId, organizationId)); return rows.map(WorkingPatternMapper.fromRow); }
  async findAll(): Promise<WorkingPattern[]> { const rows = await this.db.select().from(workingPatterns); return rows.map(WorkingPatternMapper.fromRow); }
  async save(pattern: WorkingPattern): Promise<void> { await this.db.insert(workingPatterns).values(WorkingPatternMapper.toRow(pattern)); }
  async update(pattern: WorkingPattern): Promise<void> { await this.db.update(workingPatterns).set(WorkingPatternMapper.toRow(pattern)).where(eq(workingPatterns.id, pattern.id)); }
  async archive(id: WorkingPatternId): Promise<void> { await this.db.delete(workingPatterns).where(eq(workingPatterns.id, id)); }
  async exists(id: WorkingPatternId): Promise<boolean> { const rows = await this.db.select({ id: workingPatterns.id }).from(workingPatterns).where(eq(workingPatterns.id, id)).limit(1); return rows.length > 0; }
}
