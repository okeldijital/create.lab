import type { OrganizationId } from "@creative-lab/organization";
import type { Service } from "../aggregates/Service/Service.js";
import type { ServiceStatus } from "../enums/ServiceStatus.js";
import type { ServiceCategoryId, ServiceId } from "../types/ids.js";

export interface ServiceRepository {
  findById(id: ServiceId): Promise<Service | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Service[]>;
  findByServiceCode(
    organizationId: OrganizationId,
    serviceCode: string,
  ): Promise<Service | null>;
  findByCategory(categoryId: ServiceCategoryId): Promise<Service[]>;
  findByStatus(status: ServiceStatus): Promise<Service[]>;
  save(service: Service): Promise<void>;
  update(service: Service): Promise<void>;
  archive(id: ServiceId): Promise<void>;
  exists(id: ServiceId): Promise<boolean>;
}
