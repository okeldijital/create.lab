import { ValueObject } from "@creative-lab/core";
import { WorkerValidationError } from "../errors/WorkforceErrors.js";

export class EmployeeNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): EmployeeNumber {
    if (typeof raw !== "string") {
      throw new WorkerValidationError("Employee number must be a string.");
    }
    const value = raw.trim();
    if (!value) {
      throw new WorkerValidationError("Employee number is required.");
    }
    if (value.length > 50) {
      throw new WorkerValidationError(
        "Employee number must be at most 50 characters.",
      );
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) {
      throw new WorkerValidationError(
        `Invalid employee number format: ${raw}`,
      );
    }
    return new EmployeeNumber(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: EmployeeNumber | null | undefined): boolean {
    if (other == null || !(other instanceof EmployeeNumber)) return false;
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  override toString(): string {
    return this.props.value;
  }
}
