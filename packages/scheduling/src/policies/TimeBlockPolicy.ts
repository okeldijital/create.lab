import type { TimeBlock } from "../aggregates/TimeBlock/TimeBlock.js";
import {
  ScheduleValidationError,
  TimeBlockOverlapError,
} from "../errors/SchedulingErrors.js";

export class TimeBlockPolicy {
  static assertNoOverlap(
    existing: readonly TimeBlock[],
    candidate: { start: Date; end: Date; excludeId?: string },
  ): void {
    for (const block of existing) {
      if (candidate.excludeId && block.id === candidate.excludeId) continue;
      if (!block.isOpen && !block.isCompleted) continue; // skip REMOVED
      if (
        candidate.start.getTime() < block.end.getTime() &&
        block.start.getTime() < candidate.end.getTime()
      ) {
        throw new TimeBlockOverlapError(
          `Time block overlaps existing block "${block.id}" on the schedule.`,
        );
      }
    }
  }

  static assertOpen(block: TimeBlock): void {
    if (!block.isOpen) {
      throw new ScheduleValidationError(
        `Time block "${block.id}" is not open for booking.`,
      );
    }
  }

  static assertMutable(block: TimeBlock): void {
    if (block.isCompleted) {
      throw new ScheduleValidationError(
        "Completed time blocks are immutable.",
      );
    }
  }
}
