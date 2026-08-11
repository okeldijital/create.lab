import { ValueObject } from "@creative-lab/core";
import { StudioValidationError } from "../errors/StudioErrors.js";

const MAX_LENGTH = 150;

export class StudioName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): StudioName {
    if (typeof raw !== "string") {
      throw new StudioValidationError("Studio name must be a string.");
    }
    const value = raw.trim();
    if (value.length === 0) {
      throw new StudioValidationError("Studio name is required.");
    }
    if (value.length > MAX_LENGTH) {
      throw new StudioValidationError(
        `Studio name must be at most ${MAX_LENGTH} characters.`,
      );
    }
    return new StudioName(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: StudioName | null | undefined): boolean {
    if (other == null || !(other instanceof StudioName)) return false;
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  override toString(): string {
    return this.props.value;
  }
}
