import { ValueObject } from "@creative-lab/core";
import { OperationsValidationError } from "../errors/OperationsErrors.js";

/** Positive duration in milliseconds. */
export class SessionDuration extends ValueObject<{ milliseconds: number }> {
  private constructor(milliseconds: number) {
    super({ milliseconds });
  }
  static fromMilliseconds(ms: number): SessionDuration {
    if (!Number.isFinite(ms) || ms <= 0) {
      throw new OperationsValidationError(
        `Session duration must be positive (received ${ms} ms).`,
      );
    }
    return new SessionDuration(ms);
  }
  static between(start: Date, end: Date): SessionDuration {
    return SessionDuration.fromMilliseconds(end.getTime() - start.getTime());
  }
  get milliseconds(): number {
    return this.props.milliseconds;
  }
  get minutes(): number {
    return this.props.milliseconds / 60_000;
  }
  override equals(other: SessionDuration | null | undefined): boolean {
    return super.equals(other);
  }
}
