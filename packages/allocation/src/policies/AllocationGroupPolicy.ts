import type { AllocationGroup } from "../aggregates/AllocationGroup/AllocationGroup.js";
import {
  DuplicateAllocationGroupError,
  InvalidAllocationStateError,
} from "../errors/AllocationErrors.js";
import type { OrganizationId } from "@creative-lab/organization";
import { AllocationName } from "../value-objects/AllocationName.js";

export class AllocationGroupPolicy {
  static assertUniqueName(
    existing: readonly AllocationGroup[],
    name: string,
    organizationId: OrganizationId,
    excludeId?: string,
  ): void {
    const candidate = AllocationName.create(name);
    const dup = existing.find(
      (g) =>
        g.id !== excludeId &&
        g.organizationId === organizationId &&
        !g.archived &&
        g.name.equalsIgnoreCase(candidate),
    );
    if (dup) {
      throw new DuplicateAllocationGroupError(candidate.value, organizationId);
    }
  }

  static assertMutable(group: AllocationGroup): void {
    if (group.archived) {
      throw new InvalidAllocationStateError(
        "Archived allocation groups are immutable.",
      );
    }
  }
}
