import type { OrganizationId } from "@creative-lab/organization";
import type { Position } from "../aggregates/Position/Position.js";
import type { PositionId } from "../types/ids.js";

export interface PositionRepository {
  findById(id: PositionId): Promise<Position | null>;
  findAll(): Promise<Position[]>;
  findByOrganization(organizationId: OrganizationId): Promise<Position[]>;
  findByTitle(
    organizationId: OrganizationId,
    title: string,
  ): Promise<Position | null>;
  save(position: Position): Promise<void>;
  update(position: Position): Promise<void>;
  archive(id: PositionId): Promise<void>;
  exists(id: PositionId): Promise<boolean>;
  existsByTitle(
    organizationId: OrganizationId,
    title: string,
  ): Promise<boolean>;
  delete(id: PositionId): Promise<void>;
}
