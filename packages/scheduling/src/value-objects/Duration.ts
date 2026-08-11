import { ValueObject } from "@creative-lab/core";
import { InvalidTimeRangeError } from "../errors/SchedulingErrors.js";

/** Positive duration in milliseconds. */
export class Duration extends ValueObject<{ milliseconds: number }> {
  private constructor(milliseconds: number) {
    super({ milliseconds });
  }

  static fromMilliseconds(ms: number): Duration {
    if (!Number.isFinite(ms) || ms <= 0) {
      throw new InvalidTimeRangeError(
        `Duration must be positive (received ${ms} ms).`,
      );
    }
    return new Duration(ms);
  }

  static between(start: Date, end: Date): Duration {
    return Duration.fromMilliseconds(end.getTime() - start.getTime());
  }

  get milliseconds(): number {
    return this.props.milliseconds;
  }

  get minutes(): number {
    return this.props.milliseconds / 60_000;
  }

  override equals(other: Duration | null | undefined): boolean {
    return super.equals(other);
  }
}
