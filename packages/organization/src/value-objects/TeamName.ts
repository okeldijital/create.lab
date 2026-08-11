import { ValueObject } from "@creative-lab/core";
import { TeamValidationError } from "../errors/TeamErrors.js";

const MAX_LENGTH = 150;

export class TeamName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): TeamName {
    if (typeof raw !== "string") {
      throw new TeamValidationError("Team name must be a string.");
    }
    const value = raw.trim();
    if (value.length === 0) {
      throw new TeamValidationError("Team name is required.");
    }
    if (value.length > MAX_LENGTH) {
      throw new TeamValidationError(
        `Team name must be at most ${MAX_LENGTH} characters.`,
      );
    }
    return new TeamName(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: TeamName | null | undefined): boolean {
    if (other == null || !(other instanceof TeamName)) return false;
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  override toString(): string {
    return this.props.value;
  }
}
