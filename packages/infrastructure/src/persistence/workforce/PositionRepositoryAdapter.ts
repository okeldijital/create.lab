import type { OrganizationId } from "@creative-lab/organization";
import type { Position, PositionId, PositionRepository } from "@creative-lab/workforce";
import { PositionStatus } from "@creative-lab/workforce";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { positions } from "./schema.js";
import { PositionMapper } from "./mappers.js";

export class PostgresPositionRepository implements PositionRepository {
  constructor(private readonly db: DrizzleDatabase) {}
  async findById(id: PositionId): Promise<Position | null> {
    const rows = await this.db.select().from(positions).where(eq(positions.id, id)).limit(1);
    return rows[0] ? PositionMapper.fromRow(rows[0]) : null;
  }
  async findAll(): Promise<Position[]> {
    const rows = await this.db.select().from(positions);
    return rows.map(PositionMapper.fromRow);
  }
  async findByOrganization(organizationId: OrganizationId): Promise<Position[]> {
    const rows = await this.db.select().from(positions).where(eq(positions.organizationId, organizationId));
    return rows.map(PositionMapper.fromRow);
  }
  async findByTitle(organizationId: OrganizationId, title: string): Promise<Position | null> {
    const rows = await this.db.select().from(positions).where(and(eq(positions.organizationId, organizationId), eq(positions.title, title))).limit(1);
    return rows[0] ? PositionMapper.fromRow(rows[0]) : null;
  }
  async save(position: Position): Promise<void> {
    await this.db.insert(positions).values(PositionMapper.toRow(position));
  }
  async update(position: Position): Promise<void> {
    await this.db.update(positions).set(PositionMapper.toRow(position)).where(eq(positions.id, position.id));
  }
  async archive(id: PositionId): Promise<void> {
    const now = new Date();
    await this.db.update(positions).set({ status: PositionStatus.ARCHIVED, updatedAt: now }).where(eq(positions.id, id));
  }
  async exists(id: PositionId): Promise<boolean> {
    const rows = await this.db.select({ id: positions.id }).from(positions).where(eq(positions.id, id)).limit(1);
    return rows.length > 0;
  }
  async existsByTitle(organizationId: OrganizationId, title: string): Promise<boolean> {
    const rows = await this.db.select({ id: positions.id }).from(positions).where(and(eq(positions.organizationId, organizationId), eq(positions.title, title))).limit(1);
    return rows.length > 0;
  }
  async delete(id: PositionId): Promise<void> {
    await this.db.delete(positions).where(eq(positions.id, id));
  }
}
