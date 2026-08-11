import type { Schedule } from "../aggregates/Schedule/Schedule.js";
import {
  ArchivedScheduleError,
  ScheduleValidationError,
} from "../errors/SchedulingErrors.js";
import { rangesOverlap } from "../utils/time.js";

/**
 * Schedule lifecycle and purpose-period uniqueness.
 */
export class ScheduleLifecyclePolicy {
  static assertAcceptsBookings(schedule: Schedule): void {
    schedule.assertAcceptsBookings();
  }

  static assertNotArchived(schedule: Schedule): void {
    if (schedule.isArchived) {
      throw new ArchivedScheduleError(schedule.id);
    }
  }

  /**
   * Effective periods may not overlap for schedules with the same purpose
   * within an organization (null purpose treated as unique empty key).
   */
  static assertNoOverlappingPurpose(
    existing: readonly Schedule[],
    candidate: {
      purpose: string | null;
      effectiveFrom: Date;
      effectiveTo: Date | null;
      excludeId?: string;
    },
  ): void {
    const purposeKey = candidate.purpose ?? "";
    const cEnd =
      candidate.effectiveTo?.getTime() ?? Number.POSITIVE_INFINITY;
    for (const schedule of existing) {
      if (candidate.excludeId && schedule.id === candidate.excludeId) continue;
      if ((schedule.purpose ?? "") !== purposeKey) continue;
      if (schedule.isArchived) continue;
      const sEnd = schedule.effectiveTo?.getTime() ?? Number.POSITIVE_INFINITY;
      const sStart = schedule.effectiveFrom.getTime();
      const cStart = candidate.effectiveFrom.getTime();
      // treat as range overlap
      if (cStart < sEnd && sStart < cEnd) {
        throw new ScheduleValidationError(
          `Schedule purpose "${purposeKey || "(none)"}" has overlapping effective periods.`,
        );
      }
    }
  }

  static periodsOverlapDates(
    aFrom: Date,
    aTo: Date | null,
    bFrom: Date,
    bTo: Date | null,
  ): boolean {
    const aEnd = aTo ?? new Date(8640000000000000);
    const bEnd = bTo ?? new Date(8640000000000000);
    return rangesOverlap(aFrom, aEnd, bFrom, bEnd);
  }
}
