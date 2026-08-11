import type { Organization } from "../aggregates/Organization/Organization.js";
import type { OrganizationId } from "../types/ids.js";
import type { OrganizationSlug } from "../value-objects/OrganizationSlug.js";

/**
 * Persistence port for the Organization aggregate.
 * Implementations live in infrastructure — not in this package.
 */
export interface OrganizationRepository {
  findById(id: OrganizationId): Promise<Organization | null>;
  findBySlug(slug: OrganizationSlug | string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  save(organization: Organization): Promise<void>;
  update(organization: Organization): Promise<void>;
  archive(id: OrganizationId): Promise<void>;
  exists(id: OrganizationId): Promise<boolean>;
  existsBySlug(slug: OrganizationSlug | string): Promise<boolean>;
  delete(id: OrganizationId): Promise<void>;
}
