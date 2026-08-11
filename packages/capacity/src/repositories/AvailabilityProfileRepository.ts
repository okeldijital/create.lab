import type { OrganizationId } from "@creative-lab/organization";
import type { AvailabilityProfile } from "../aggregates/AvailabilityProfile/AvailabilityProfile.js";
import type { AvailabilityProfileId } from "../types/ids.js";

export interface AvailabilityProfileRepository {
  findById(id: AvailabilityProfileId): Promise<AvailabilityProfile | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<AvailabilityProfile[]>;
  findAll(): Promise<AvailabilityProfile[]>;
  save(profile: AvailabilityProfile): Promise<void>;
  update(profile: AvailabilityProfile): Promise<void>;
  archive(id: AvailabilityProfileId): Promise<void>;
  exists(id: AvailabilityProfileId): Promise<boolean>;
}
