import { ValueObject } from "@creative-lab/core";
import { PositionValidationError } from "../errors/WorkforceErrors.js";

export class PositionTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): PositionTitle {
    if (typeof raw !== "string") {
      throw new PositionValidationError("Position title must be a string.");
    }
    const value = raw.trim();
    if (!value) {
      throw new PositionValidationError("Position title is required.");
    }
    if (value.length > 150) {
      throw new PositionValidationError(
        "Position title must be at most 150 characters.",
      );
    }
    return new PositionTitle(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: PositionTitle | null | undefined): boolean {
    if (other == null || !(other instanceof PositionTitle)) return false;
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  override toString(): string {
    return this.props.value;
  }
}
