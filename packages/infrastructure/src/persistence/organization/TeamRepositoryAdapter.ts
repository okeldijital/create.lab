import type { TeamRepository, Team, TeamId, OrganizationId, DepartmentId } from "@creative-lab/organization";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { teams } from "./schema.js";
import { TeamMapper } from "./mappers.js";

export class PostgresTeamRepository implements TeamRepository {
  public constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: TeamId): Promise<Team | null> {
    const rows = await this.db.select().from(teams).where(eq(teams.id, id)).limit(1);
    return rows[0] ? TeamMapper.fromRow(rows[0]) : null;
  }

  async findByOrganizationId(organizationId: OrganizationId): Promise<Team[]> {
    const rows = await this.db.select().from(teams).where(eq(teams.organizationId, organizationId));
    return rows.map(TeamMapper.fromRow);
  }

  async findByDepartmentId(departmentId: DepartmentId): Promise<Team[]> {
    const rows = await this.db.select().from(teams).where(eq(teams.departmentId, departmentId));
    return rows.map(TeamMapper.fromRow);
  }

  async findByNameInDepartment(departmentId: DepartmentId, name: string): Promise<Team | null> {
    const rows = await this.db.select().from(teams).where(and(eq(teams.departmentId, departmentId), eq(teams.name, name))).limit(1);
    return rows[0] ? TeamMapper.fromRow(rows[0]) : null;
  }

  async findAll(): Promise<Team[]> {
    const rows = await this.db.select().from(teams);
    return rows.map(TeamMapper.fromRow);
  }

  async save(team: Team): Promise<void> {
    await this.db.insert(teams).values(TeamMapper.toRow(team));
  }

  async update(team: Team): Promise<void> {
    const row = TeamMapper.toRow(team);
    await this.db.update(teams).set(row).where(eq(teams.id, team.id));
  }

  async archive(id: TeamId): Promise<void> {
    await this.db.update(teams).set({ status: "INACTIVE", updatedAt: new Date() }).where(eq(teams.id, id));
  }

  async exists(id: TeamId): Promise<boolean> {
    const rows = await this.db.select({ id: teams.id }).from(teams).where(eq(teams.id, id)).limit(1);
    return rows.length > 0;
  }

  async existsByNameInDepartment(departmentId: DepartmentId, name: string): Promise<boolean> {
    const rows = await this.db.select({ id: teams.id }).from(teams).where(and(eq(teams.departmentId, departmentId), eq(teams.name, name))).limit(1);
    return rows.length > 0;
  }

  async delete(id: TeamId): Promise<void> {
    await this.db.delete(teams).where(eq(teams.id, id));
  }
}
