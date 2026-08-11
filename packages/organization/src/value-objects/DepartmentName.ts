import { ValueObject } from "@creative-lab/core";
import { DepartmentValidationError } from "../errors/DepartmentErrors.js";

const MAX_LENGTH = 150;

export class DepartmentName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): DepartmentName {
    if (typeof raw !== "string") {
      throw new DepartmentValidationError("Department name must be a string.");
    }
    const value = raw.trim();
    if (value.length === 0) {
      throw new DepartmentValidationError("Department name is required.");
    }
    if (value.length > MAX_LENGTH) {
      throw new DepartmentValidationError(
        `Department name must be at most ${MAX_LENGTH} characters.`,
      );
    }
    return new DepartmentName(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: DepartmentName | null | undefined): boolean {
    if (other == null || !(other instanceof DepartmentName)) return false;
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  override toString(): string {
    return this.props.value;
  }
}
