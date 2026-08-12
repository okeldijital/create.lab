import type { OrganizationId } from "@creative-lab/organization";
import type { Project, ProjectId, ProjectRepository } from "@creative-lab/projects";
import { eq, notInArray } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { projects } from "./schema.js";
import { ProjectMapper } from "./mappers.js";

export class PostgresProjectRepository implements ProjectRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ProjectId): Promise<Project | null> {
    const rows = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return rows[0] ? ProjectMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<Project[]> {
    const rows = await this.db.select().from(projects).where(eq(projects.organizationId, organizationId));
    return rows.map(ProjectMapper.fromRow);
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    const rows = await this.db.select().from(projects).where(eq(projects.ownerId, ownerId));
    return rows.map(ProjectMapper.fromRow);
  }

  async findActive(): Promise<Project[]> {
    const rows = await this.db
      .select()
      .from(projects)
      .where(notInArray(projects.status, ["CLOSED", "CANCELLED", "COMPLETED"]));
    return rows.map(ProjectMapper.fromRow);
  }

  async save(project: Project): Promise<void> {
    await this.db.insert(projects).values(ProjectMapper.toRow(project));
  }

  async update(project: Project): Promise<void> {
    await this.db.update(projects).set(ProjectMapper.toRow(project)).where(eq(projects.id, project.id));
  }

  async archive(id: ProjectId): Promise<void> {
    // Project has no ARCHIVED status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(projects).where(eq(projects.id, id));
  }

  async exists(id: ProjectId): Promise<boolean> {
    const rows = await this.db.select({ id: projects.id }).from(projects).where(eq(projects.id, id)).limit(1);
    return rows.length > 0;
  }
}
