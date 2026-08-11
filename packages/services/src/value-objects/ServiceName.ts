import { ValueObject } from "@creative-lab/core";
import { ServicesValidationError } from "../errors/ServicesErrors.js";

export class ServiceName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): ServiceName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new ServicesValidationError("Service name is required.");
    }
    if (value.length > 200) {
      throw new ServicesValidationError(
        "Service name must be at most 200 characters.",
      );
    }
    return new ServiceName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: ServiceName | null | undefined): boolean {
    return super.equals(other);
  }
}
