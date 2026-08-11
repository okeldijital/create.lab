import type { Studio } from "../aggregates/Studio/Studio.js";
import type { OrganizationId, StudioId } from "../types/ids.js";

export interface StudioRepository {
  findById(id: StudioId): Promise<Studio | null>;
  findByOrganizationId(organizationId: OrganizationId): Promise<Studio[]>;
  findByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<Studio | null>;
  findAll(): Promise<Studio[]>;
  save(studio: Studio): Promise<void>;
  update(studio: Studio): Promise<void>;
  archive(id: StudioId): Promise<void>;
  exists(id: StudioId): Promise<boolean>;
  existsByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<boolean>;
  delete(id: StudioId): Promise<void>;
}
