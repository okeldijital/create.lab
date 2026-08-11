import { ValueObject } from "@creative-lab/core";
import { EngagementValidationError } from "../errors/EngagementErrors.js";

export class DeliverableTitle extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): DeliverableTitle {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new EngagementValidationError("Deliverable title is required.");
    }
    if (value.length > 300) {
      throw new EngagementValidationError(
        "Deliverable title must be at most 300 characters.",
      );
    }
    return new DeliverableTitle(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: DeliverableTitle | null | undefined): boolean {
    return super.equals(other);
  }
}
