import type { AvailabilityProfile } from "../aggregates/AvailabilityProfile/AvailabilityProfile.js";
import type { CapacityProfile } from "../aggregates/CapacityProfile/CapacityProfile.js";
import {
  AvailabilityProfileNotFoundError,
  CapacityProfileValidationError,
} from "../errors/CapacityErrors.js";

export class AvailabilityPolicy {
  static assertAssignable(
    profile: CapacityProfile,
    availability: AvailabilityProfile | null,
  ): void {
    if (!availability) {
      throw new AvailabilityProfileNotFoundError("missing");
    }
    if (availability.organizationId !== profile.organizationId) {
      throw new CapacityProfileValidationError(
        "Availability profile must belong to the same organization.",
      );
    }
  }
}
