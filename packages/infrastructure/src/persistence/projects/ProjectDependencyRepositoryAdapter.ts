import type { OrganizationId } from "@creative-lab/organization";
import type {
  ProjectDependency,
  ProjectDependencyId,
  ProjectDependencyRepository,
  ProjectId,
} from "@creative-lab/projects";
import { eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { projectDependencies } from "./schema.js";
import { ProjectDependencyMapper } from "./mappers.js";

export class PostgresProjectDependencyRepository implements ProjectDependencyRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: ProjectDependencyId): Promise<ProjectDependency | null> {
    const rows = await this.db.select().from(projectDependencies).where(eq(projectDependencies.id, id)).limit(1);
    return rows[0] ? ProjectDependencyMapper.fromRow(rows[0]) : null;
  }

  async findByOrganization(organizationId: OrganizationId): Promise<ProjectDependency[]> {
    const rows = await this.db
      .select()
      .from(projectDependencies)
      .where(eq(projectDependencies.organizationId, organizationId));
    return rows.map(ProjectDependencyMapper.fromRow);
  }

  async findByProject(projectId: ProjectId): Promise<ProjectDependency[]> {
    const rows = await this.db
      .select()
      .from(projectDependencies)
      .where(eq(projectDependencies.projectId, projectId));
    return rows.map(ProjectDependencyMapper.fromRow);
  }

  async findDependingOn(projectId: ProjectId): Promise<ProjectDependency[]> {
    const rows = await this.db
      .select()
      .from(projectDependencies)
      .where(eq(projectDependencies.dependsOnProjectId, projectId));
    return rows.map(ProjectDependencyMapper.fromRow);
  }

  async findActive(): Promise<ProjectDependency[]> {
    const rows = await this.db
      .select()
      .from(projectDependencies)
      .where(eq(projectDependencies.status, "ACTIVE"));
    return rows.map(ProjectDependencyMapper.fromRow);
  }

  async save(dependency: ProjectDependency): Promise<void> {
    await this.db.insert(projectDependencies).values(ProjectDependencyMapper.toRow(dependency));
  }

  async update(dependency: ProjectDependency): Promise<void> {
    await this.db
      .update(projectDependencies)
      .set(ProjectDependencyMapper.toRow(dependency))
      .where(eq(projectDependencies.id, dependency.id));
  }

  async archive(id: ProjectDependencyId): Promise<void> {
    // ProjectDependency has no archive status; hard delete implements repository archive without inventing lifecycle.
    await this.db.delete(projectDependencies).where(eq(projectDependencies.id, id));
  }

  async exists(id: ProjectDependencyId): Promise<boolean> {
    const rows = await this.db
      .select({ id: projectDependencies.id })
      .from(projectDependencies)
      .where(eq(projectDependencies.id, id))
      .limit(1);
    return rows.length > 0;
  }
}
