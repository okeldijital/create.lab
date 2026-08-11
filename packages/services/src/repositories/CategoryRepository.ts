import type { OrganizationId } from "@creative-lab/organization";
import type { ServiceCategory } from "../aggregates/ServiceCategory/ServiceCategory.js";
import type { ServiceCategoryId } from "../types/ids.js";

export interface CategoryRepository {
  findById(id: ServiceCategoryId): Promise<ServiceCategory | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ServiceCategory[]>;
  findByName(
    organizationId: OrganizationId,
    name: string,
  ): Promise<ServiceCategory | null>;
  save(category: ServiceCategory): Promise<void>;
  update(category: ServiceCategory): Promise<void>;
  archive(id: ServiceCategoryId): Promise<void>;
  exists(id: ServiceCategoryId): Promise<boolean>;
}
