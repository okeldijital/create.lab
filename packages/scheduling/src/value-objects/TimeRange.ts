import { ValueObject } from "@creative-lab/core";
import { InvalidTimeRangeError } from "../errors/SchedulingErrors.js";

/**
 * Absolute date-time range (UTC instants). End must be strictly after start.
 */
export class TimeRange extends ValueObject<{ start: Date; end: Date }> {
  private constructor(start: Date, end: Date) {
    super({ start, end });
  }

  static create(start: Date, end: Date): TimeRange {
    if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
      throw new InvalidTimeRangeError("Start time is invalid.");
    }
    if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
      throw new InvalidTimeRangeError("End time is invalid.");
    }
    if (end.getTime() <= start.getTime()) {
      throw new InvalidTimeRangeError(
        "End must be after start (positive duration required).",
      );
    }
    return new TimeRange(new Date(start.getTime()), new Date(end.getTime()));
  }

  get start(): Date {
    return new Date(this.props.start);
  }
  get end(): Date {
    return new Date(this.props.end);
  }

  get durationMs(): number {
    return this.props.end.getTime() - this.props.start.getTime();
  }

  overlaps(other: TimeRange): boolean {
    return (
      this.props.start.getTime() < other.props.end.getTime() &&
      other.props.start.getTime() < this.props.end.getTime()
    );
  }

  override equals(other: TimeRange | null | undefined): boolean {
    return super.equals(other);
  }
}
