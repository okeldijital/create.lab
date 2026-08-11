import { ValueObject } from "@creative-lab/core";
import { ProjectPriority } from "../enums/ProjectPriority.js";
import { ProjectValidationError } from "../errors/ProjectErrors.js";

export class Priority extends ValueObject<{ value: ProjectPriority }> {
  private constructor(value: ProjectPriority) {
    super({ value });
  }
  static create(value: ProjectPriority = ProjectPriority.NORMAL): Priority {
    if (!Object.values(ProjectPriority).includes(value)) {
      throw new ProjectValidationError(
        `Invalid project priority: ${String(value)}`,
      );
    }
    return new Priority(value);
  }
  get value(): ProjectPriority {
    return this.props.value;
  }
  override equals(other: Priority | null | undefined): boolean {
    return super.equals(other);
  }
}
