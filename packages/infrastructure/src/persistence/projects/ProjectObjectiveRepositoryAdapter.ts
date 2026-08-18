import type { OrganizationId } from "@creative-lab/organization";
import type {
  ProjectId,
  ProjectObjective,
  ProjectObjectiveId,
  ProjectObjectiveRepository,
} from "@creative-lab/projects";
import { eq, notInArray } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { projectObjectives } from "./schema.js";
import { ProjectObjectiveMapper } from "./mappers.js";

export class PostgresProjectObjectiveRepository implements ProjectObjectiveRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ProjectObjectiveId): Promise<ProjectObjective | null> {
    const rows = await this.db.select().from(projectObjectives).where(eq(projectObjectives.id, id)).limit(1);
    return rows[0] ? ProjectObjectiveMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<ProjectObjective[]> {
    const rows = await this.db
      .select()
      .from(projectObjectives)
      .where(eq(projectObjectives.organizationId, organizationId));
    return rows.map(ProjectObjectiveMapper.fromRow);
  }

  async findByProject(projectId: ProjectId): Promise<ProjectObjective[]> {
    const rows = await this.db.select().from(projectObjectives).where(eq(projectObjectives.projectId, projectId));
    return rows.map(ProjectObjectiveMapper.fromRow);
  }

  async findActive(): Promise<ProjectObjective[]> {
    const rows = await this.db
      .select()
      .from(projectObjectives)
      .where(notInArray(projectObjectives.status, ["ACHIEVED", "FAILED"]));
    return rows.map(ProjectObjectiveMapper.fromRow);
  }

  async save(objective: ProjectObjective): Promise<void> {
    await this.db.insert(projectObjectives).values(ProjectObjectiveMapper.toRow(objective));
  }

  async update(objective: ProjectObjective): Promise<void> {
    await this.db
      .update(projectObjectives)
      .set(ProjectObjectiveMapper.toRow(objective))
      .where(eq(projectObjectives.id, objective.id));
  }

  async archive(id: ProjectObjectiveId): Promise<void> {
    // ProjectObjective has no archive status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(projectObjectives).where(eq(projectObjectives.id, id));
  }

  async exists(id: ProjectObjectiveId): Promise<boolean> {
    const rows = await this.db
      .select({ id: projectObjectives.id })
      .from(projectObjectives)
      .where(eq(projectObjectives.id, id))
      .limit(1);
    return rows.length > 0;
  }
}
