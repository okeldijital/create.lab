import type { OrganizationSettings } from "../aggregates/OrganizationSettings/OrganizationSettings.js";
import type { OrganizationId } from "../types/ids.js";

export interface OrganizationSettingsRepository {
  findByOrganizationId(
    organizationId: OrganizationId,
  ): Promise<OrganizationSettings | null>;
  findById(organizationId: OrganizationId): Promise<OrganizationSettings | null>;
  findAll(): Promise<OrganizationSettings[]>;
  save(settings: OrganizationSettings): Promise<void>;
  update(settings: OrganizationSettings): Promise<void>;
  archive(organizationId: OrganizationId): Promise<void>;
  exists(organizationId: OrganizationId): Promise<boolean>;
  delete(organizationId: OrganizationId): Promise<void>;
}
