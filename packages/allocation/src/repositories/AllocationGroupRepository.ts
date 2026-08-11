import type { OrganizationId } from "@creative-lab/organization";
import type { AllocationGroup } from "../aggregates/AllocationGroup/AllocationGroup.js";
import type { AllocationGroupId } from "../types/ids.js";

export interface AllocationGroupRepository {
  findById(id: AllocationGroupId): Promise<AllocationGroup | null>;
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<AllocationGroup[]>;
  save(group: AllocationGroup): Promise<void>;
  update(group: AllocationGroup): Promise<void>;
  archive(id: AllocationGroupId): Promise<void>;
  exists(id: AllocationGroupId): Promise<boolean>;
}
