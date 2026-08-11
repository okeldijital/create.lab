import { ValueObject } from "@creative-lab/core";
import { ProjectValidationError } from "../errors/ProjectErrors.js";

export class ObjectiveName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ObjectiveName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ProjectValidationError("Objective name is required.");
    }
    if (value.length > 200) {
      throw new ProjectValidationError(
        "Objective name must be at most 200 characters.",
      );
    }
    return new ObjectiveName(value);
  }
  get value(): string {
    return this.props.value;
  }
  equalsIgnoreCase(other: ObjectiveName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
  override equals(other: ObjectiveName | null | undefined): boolean {
    return super.equals(other);
  }
}
