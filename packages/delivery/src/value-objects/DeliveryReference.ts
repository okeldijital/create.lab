import { ValueObject } from "@creative-lab/core";
import { DeliveryValidationError } from "../errors/DeliveryErrors.js";

export class DeliveryReference extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): DeliveryReference {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new DeliveryValidationError("Delivery reference is required.");
    }
    if (value.length > 64) {
      throw new DeliveryValidationError(
        "Delivery reference must be at most 64 characters.",
      );
    }
    return new DeliveryReference(value);
  }
  static generate(now: Date = new Date()): DeliveryReference {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return DeliveryReference.create(`DEL-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: DeliveryReference | null | undefined): boolean {
    return super.equals(other);
  }
}
