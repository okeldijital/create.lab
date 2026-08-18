import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId, ProjectPhase, ProjectPhaseId, ProjectPhaseRepository } from "@creative-lab/projects";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { projectPhases } from "./schema.js";
import { ProjectPhaseMapper } from "./mappers.js";

export class PostgresProjectPhaseRepository implements ProjectPhaseRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ProjectPhaseId): Promise<ProjectPhase | null> {
    const rows = await this.db.select().from(projectPhases).where(eq(projectPhases.id, id)).limit(1);
    return rows[0] ? ProjectPhaseMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<ProjectPhase[]> {
    const rows = await this.db.select().from(projectPhases).where(eq(projectPhases.organizationId, organizationId));
    return rows.map(ProjectPhaseMapper.fromRow);
  }

  async findByProject(projectId: ProjectId): Promise<ProjectPhase[]> {
    const rows = await this.db.select().from(projectPhases).where(eq(projectPhases.projectId, projectId));
    return rows.map(ProjectPhaseMapper.fromRow);
  }

  async findActive(): Promise<ProjectPhase[]> {
    const rows = await this.db.select().from(projectPhases).where(eq(projectPhases.status, "ACTIVE"));
    return rows.map(ProjectPhaseMapper.fromRow);
  }

  async save(phase: ProjectPhase): Promise<void> {
    await this.db.insert(projectPhases).values(ProjectPhaseMapper.toRow(phase));
  }

  async update(phase: ProjectPhase): Promise<void> {
    await this.db.update(projectPhases).set(ProjectPhaseMapper.toRow(phase)).where(eq(projectPhases.id, phase.id));
  }

  async archive(id: ProjectPhaseId): Promise<void> {
    // ProjectPhase has no archive status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(projectPhases).where(eq(projectPhases.id, id));
  }

  async exists(id: ProjectPhaseId): Promise<boolean> {
    const rows = await this.db.select({ id: projectPhases.id }).from(projectPhases).where(eq(projectPhases.id, id)).limit(1);
    return rows.length > 0;
  }
}
