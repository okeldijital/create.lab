import { ValueObject } from "@creative-lab/core";
import { InvalidIncidentStateError } from "../errors/OperationsErrors.js";

export class IncidentDescription extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): IncidentDescription {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new InvalidIncidentStateError("Incident description is required.");
    }
    if (value.length > 2000) {
      throw new InvalidIncidentStateError(
        "Incident description must be at most 2000 characters.",
      );
    }
    return new IncidentDescription(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: IncidentDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
