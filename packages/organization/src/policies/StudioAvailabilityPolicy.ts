import type { Studio } from "../aggregates/Studio/Studio.js";
import { StudioStatus } from "../enums/StudioStatus.js";
import { StudioValidationError } from "../errors/StudioErrors.js";

/**
 * Policy for studio operational availability.
 */
export class StudioAvailabilityPolicy {
  static assertAvailable(studio: Studio): void {
    if (studio.status === StudioStatus.ARCHIVED) {
      throw new StudioValidationError(
        `Studio "${studio.id}" is archived and unavailable.`,
      );
    }
    if (studio.status === StudioStatus.MAINTENANCE) {
      throw new StudioValidationError(
        `Studio "${studio.id}" is under maintenance.`,
      );
    }
    if (studio.status === StudioStatus.UNAVAILABLE) {
      throw new StudioValidationError(
        `Studio "${studio.id}" is currently unavailable.`,
      );
    }
    if (studio.status !== StudioStatus.AVAILABLE) {
      throw new StudioValidationError(
        `Studio "${studio.id}" is not available (status: ${studio.status}).`,
      );
    }
  }

  static isAvailable(studio: Studio): boolean {
    return studio.status === StudioStatus.AVAILABLE;
  }

  static assertCapacitySufficient(
    studio: Studio,
    requiredCapacity: number,
  ): void {
    this.assertAvailable(studio);
    if (requiredCapacity < 0) {
      throw new StudioValidationError("Required capacity cannot be negative.");
    }
    if (studio.capacity < requiredCapacity) {
      throw new StudioValidationError(
        `Studio "${studio.id}" capacity ${studio.capacity} is less than required ${requiredCapacity}.`,
      );
    }
  }
}
