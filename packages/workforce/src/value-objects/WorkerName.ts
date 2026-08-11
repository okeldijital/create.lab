import { ValueObject } from "@creative-lab/core";
import { WorkerValidationError } from "../errors/WorkforceErrors.js";

export class WorkerName extends ValueObject<{ firstName: string; lastName: string; preferredName: string | null }> {
  private constructor(
    firstName: string,
    lastName: string,
    preferredName: string | null,
  ) {
    super({ firstName, lastName, preferredName });
  }

  static create(input: {
    firstName: string;
    lastName: string;
    preferredName?: string | null;
  }): WorkerName {
    const firstName = input.firstName?.trim() ?? "";
    const lastName = input.lastName?.trim() ?? "";
    if (!firstName) {
      throw new WorkerValidationError("First name is required.");
    }
    if (!lastName) {
      throw new WorkerValidationError("Last name is required.");
    }
    if (firstName.length > 100 || lastName.length > 100) {
      throw new WorkerValidationError(
        "Name parts must be at most 100 characters.",
      );
    }
    const preferred = input.preferredName?.trim() || null;
    return new WorkerName(firstName, lastName, preferred);
  }

  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get preferredName(): string | null {
    return this.props.preferredName;
  }
  get displayName(): string {
    return this.props.preferredName ?? `${this.props.firstName} ${this.props.lastName}`;
  }
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  override equals(other: WorkerName | null | undefined): boolean {
    return super.equals(other);
  }
}
