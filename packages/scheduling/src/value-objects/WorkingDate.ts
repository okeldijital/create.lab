import { ValueObject } from "@creative-lab/core";
import { InvalidTimeRangeError } from "../errors/SchedulingErrors.js";

/** Calendar date as YYYY-MM-DD (UTC day identity). */
export class WorkingDate extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string | Date): WorkingDate {
    if (raw instanceof Date) {
      if (Number.isNaN(raw.getTime())) {
        throw new InvalidTimeRangeError("Invalid working date.");
      }
      const y = raw.getUTCFullYear();
      const m = String(raw.getUTCMonth() + 1).padStart(2, "0");
      const d = String(raw.getUTCDate()).padStart(2, "0");
      return new WorkingDate(`${y}-${m}-${d}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      throw new InvalidTimeRangeError(
        `Working date must be YYYY-MM-DD (received ${raw}).`,
      );
    }
    return new WorkingDate(raw);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: WorkingDate | null | undefined): boolean {
    return super.equals(other);
  }
}
