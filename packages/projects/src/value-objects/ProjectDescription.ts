import { ValueObject } from "@creative-lab/core";
import { ProjectValidationError } from "../errors/ProjectErrors.js";

export class ProjectDescription extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): ProjectDescription {
    if (raw === null || raw === undefined || raw.trim() === "") {
      return new ProjectDescription(null);
    }
    const value = raw.trim();
    if (value.length > 5000) {
      throw new ProjectValidationError(
        "Project description must be at most 5000 characters.",
      );
    }
    return new ProjectDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: ProjectDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
