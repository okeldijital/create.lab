import { ValueObject } from "@creative-lab/core";
import { InvalidShiftError } from "../errors/SchedulingErrors.js";
import { parseWorkingTimeToMinutes } from "../utils/time.js";

/** Wall-clock time HH:mm (24h). */
export class WorkingTime extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): WorkingTime {
    try {
      parseWorkingTimeToMinutes(raw);
    } catch {
      throw new InvalidShiftError(`Invalid working time: ${raw}`);
    }
    return new WorkingTime(raw);
  }

  get value(): string {
    return this.props.value;
  }

  get minutesSinceMidnight(): number {
    return parseWorkingTimeToMinutes(this.props.value);
  }

  override equals(other: WorkingTime | null | undefined): boolean {
    return super.equals(other);
  }
}
