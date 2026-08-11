import { ValueObject } from "@creative-lab/core";
import { ProjectValidationError } from "../errors/ProjectErrors.js";

export class ProjectName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ProjectName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ProjectValidationError("Project name is required.");
    }
    if (value.length > 200) {
      throw new ProjectValidationError(
        "Project name must be at most 200 characters.",
      );
    }
    return new ProjectName(value);
  }
  get value(): string {
    return this.props.value;
  }
  /** Case-insensitive uniqueness helper. */
  equalsIgnoreCase(other: ProjectName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
  override equals(other: ProjectName | null | undefined): boolean {
    return super.equals(other);
  }
}
