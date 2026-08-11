import type { OrganizationId } from "@creative-lab/organization";
import type { Capability } from "../aggregates/Capability/Capability.js";
import type { CapabilityId, CapacityProfileId } from "../types/ids.js";

export interface CapabilityRepository {
  findById(id: CapabilityId): Promise<Capability | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Capability[]>;
  findByCapacityProfile(
    capacityProfileId: CapacityProfileId,
  ): Promise<Capability[]>;
  findActiveByProfileAndName(
    capacityProfileId: CapacityProfileId,
    name: string,
  ): Promise<Capability | null>;
  findAll(): Promise<Capability[]>;
  save(capability: Capability): Promise<void>;
  update(capability: Capability): Promise<void>;
  archive(id: CapabilityId): Promise<void>;
  exists(id: CapabilityId): Promise<boolean>;
}
