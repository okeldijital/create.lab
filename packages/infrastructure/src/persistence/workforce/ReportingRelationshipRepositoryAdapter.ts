import type { OrganizationId } from "@creative-lab/organization";
import type { ReportingRelationship, ReportingRelationshipId, ReportingRelationshipRepository, WorkerId } from "@creative-lab/workforce";
import { and, eq, isNull } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { reportingRelationships } from "./schema.js";
import { ReportingRelationshipMapper } from "./mappers.js";

export class PostgresReportingRelationshipRepository implements ReportingRelationshipRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: ReportingRelationshipId): Promise<ReportingRelationship | null> {
    const rows = await this.db.select().from(reportingRelationships).where(eq(reportingRelationships.id, id)).limit(1);
    return rows[0] ? ReportingRelationshipMapper.fromRow(rows[0]) : null;
  }
  async findAll(): Promise<ReportingRelationship[]> {
    const rows = await this.db.select().from(reportingRelationships);
    return rows.map(ReportingRelationshipMapper.fromRow);
  }
  async findByOrganization(organizationId: OrganizationId): Promise<ReportingRelationship[]> {
    const rows = await this.db.select().from(reportingRelationships).where(eq(reportingRelationships.organizationId, organizationId));
    return rows.map(ReportingRelationshipMapper.fromRow);
  }
  async findActiveByWorker(workerId: WorkerId): Promise<ReportingRelationship | null> {
    const rows = await this.db.select().from(reportingRelationships).where(and(eq(reportingRelationships.workerId, workerId), isNull(reportingRelationships.endDate))).limit(1);
    return rows[0] ? ReportingRelationshipMapper.fromRow(rows[0]) : null;
  }
  async findActiveByManager(managerId: WorkerId): Promise<ReportingRelationship[]> {
    const rows = await this.db.select().from(reportingRelationships).where(and(eq(reportingRelationships.managerId, managerId), isNull(reportingRelationships.endDate)));
    return rows.map(ReportingRelationshipMapper.fromRow);
  }
  async save(relationship: ReportingRelationship): Promise<void> {
    await this.db.insert(reportingRelationships).values(ReportingRelationshipMapper.toRow(relationship));
  }
  async update(relationship: ReportingRelationship): Promise<void> {
    await this.db.update(reportingRelationships).set(ReportingRelationshipMapper.toRow(relationship)).where(eq(reportingRelationships.id, relationship.id));
  }
  async archive(id: ReportingRelationshipId): Promise<void> {
    await this.db.delete(reportingRelationships).where(eq(reportingRelationships.id, id));
  }
  async exists(id: ReportingRelationshipId): Promise<boolean> {
    const rows = await this.db.select({ id: reportingRelationships.id }).from(reportingRelationships).where(eq(reportingRelationships.id, id)).limit(1);
    return rows.length > 0;
  }
  async delete(id: ReportingRelationshipId): Promise<void> {
    await this.db.delete(reportingRelationships).where(eq(reportingRelationships.id, id));
  }
}
