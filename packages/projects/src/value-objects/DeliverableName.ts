import { ValueObject } from "@creative-lab/core";
import { ProjectValidationError } from "../errors/ProjectErrors.js";

export class DeliverableName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): DeliverableName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ProjectValidationError("Deliverable name is required.");
    }
    if (value.length > 200) {
      throw new ProjectValidationError(
        "Deliverable name must be at most 200 characters.",
      );
    }
    return new DeliverableName(value);
  }
  get value(): string {
    return this.props.value;
  }
  equalsIgnoreCase(other: DeliverableName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
  override equals(other: DeliverableName | null | undefined): boolean {
    return super.equals(other);
  }
}
