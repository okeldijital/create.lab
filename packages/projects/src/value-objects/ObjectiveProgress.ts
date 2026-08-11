import { ValueObject } from "@creative-lab/core";
import { ProjectValidationError } from "../errors/ProjectErrors.js";

/** Progress percentage in range [0, 100]. */
export class ObjectiveProgress extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(value: number): ObjectiveProgress {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new ProjectValidationError(
        `Objective progress must be between 0 and 100 (received ${value}).`,
      );
    }
    return new ObjectiveProgress(value);
  }
  static zero(): ObjectiveProgress {
    return ObjectiveProgress.create(0);
  }
  static complete(): ObjectiveProgress {
    return ObjectiveProgress.create(100);
  }
  get value(): number {
    return this.props.value;
  }
  get isComplete(): boolean {
    return this.props.value >= 100;
  }
  override equals(other: ObjectiveProgress | null | undefined): boolean {
    return super.equals(other);
  }
}
