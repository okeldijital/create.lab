import type { OrganizationId } from "@creative-lab/organization";
import type { ResourceCapacity } from "../aggregates/ResourceCapacity/ResourceCapacity.js";
import type { CapacityProfileId, ResourceCapacityId } from "../types/ids.js";

export interface ResourceCapacityRepository {
  findById(id: ResourceCapacityId): Promise<ResourceCapacity | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ResourceCapacity[]>;
  findByCapacityProfile(
    capacityProfileId: CapacityProfileId,
  ): Promise<ResourceCapacity[]>;
  findAll(): Promise<ResourceCapacity[]>;
  save(capacity: ResourceCapacity): Promise<void>;
  update(capacity: ResourceCapacity): Promise<void>;
  archive(id: ResourceCapacityId): Promise<void>;
  exists(id: ResourceCapacityId): Promise<boolean>;
}
