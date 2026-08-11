import type { OrganizationId } from "@creative-lab/organization";
import type { CapacityProfile } from "../aggregates/CapacityProfile/CapacityProfile.js";
import type { CapacityProfileId, ResourceId } from "../types/ids.js";

export interface CapacityProfileRepository {
  findById(id: CapacityProfileId): Promise<CapacityProfile | null>;
  findByOrganization(organizationId: OrganizationId): Promise<CapacityProfile[]>;
  findByResource(resourceId: ResourceId): Promise<CapacityProfile[]>;
  findActiveByResource(resourceId: ResourceId): Promise<CapacityProfile | null>;
  findAll(): Promise<CapacityProfile[]>;
  save(profile: CapacityProfile): Promise<void>;
  update(profile: CapacityProfile): Promise<void>;
  archive(id: CapacityProfileId): Promise<void>;
  exists(id: CapacityProfileId): Promise<boolean>;
}
