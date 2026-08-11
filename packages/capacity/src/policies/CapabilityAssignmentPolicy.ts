import type { Capability } from "../aggregates/Capability/Capability.js";
import type { CapacityProfile } from "../aggregates/CapacityProfile/CapacityProfile.js";
import { DuplicateCapabilityError } from "../errors/CapacityErrors.js";
import { CapacityLifecyclePolicy } from "./CapacityLifecyclePolicy.js";

export class CapabilityAssignmentPolicy {
  static assertCanAdd(
    profile: CapacityProfile,
    existing: readonly Capability[],
    name: string,
  ): void {
    CapacityLifecyclePolicy.assertActive(profile);
    const target = name.trim().toLowerCase();
    const duplicate = existing.find(
      (c) => c.active && c.name.value.toLowerCase() === target,
    );
    if (duplicate) {
      throw new DuplicateCapabilityError(name.trim(), profile.id);
    }
  }
}
