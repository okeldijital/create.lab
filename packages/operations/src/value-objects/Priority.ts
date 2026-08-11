import { ValueObject } from "@creative-lab/core";
import { WorkPriority } from "../enums/WorkPriority.js";
import { OperationsValidationError } from "../errors/OperationsErrors.js";

export class Priority extends ValueObject<{ value: WorkPriority }> {
  private constructor(value: WorkPriority) {
    super({ value });
  }
  static create(value: WorkPriority = WorkPriority.NORMAL): Priority {
    if (!Object.values(WorkPriority).includes(value)) {
      throw new OperationsValidationError(
        `Invalid work priority: ${String(value)}`,
      );
    }
    return new Priority(value);
  }
  get value(): WorkPriority {
    return this.props.value;
  }
  override equals(other: Priority | null | undefined): boolean {
    return super.equals(other);
  }
}
