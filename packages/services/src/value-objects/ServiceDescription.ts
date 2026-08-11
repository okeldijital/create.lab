import { ValueObject } from "@creative-lab/core";
import { ServicesValidationError } from "../errors/ServicesErrors.js";

export class ServiceDescription extends ValueObject<{ value: string | null }> {
  private constructor(value: string | null) {
    super({ value });
  }
  static create(raw: string | null | undefined): ServiceDescription {
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      return new ServiceDescription(null);
    }
    const value = raw.trim();
    if (value.length > 2000) {
      throw new ServicesValidationError(
        "Service description must be at most 2000 characters.",
      );
    }
    return new ServiceDescription(value);
  }
  get value(): string | null {
    return this.props.value;
  }
  override equals(other: ServiceDescription | null | undefined): boolean {
    return super.equals(other);
  }
}
