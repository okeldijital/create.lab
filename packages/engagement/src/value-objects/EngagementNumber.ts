import { ValueObject } from "@creative-lab/core";
import { EngagementValidationError } from "../errors/EngagementErrors.js";

export class EngagementNumber extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): EngagementNumber {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new EngagementValidationError("Engagement number is required.");
    }
    if (value.length > 64) {
      throw new EngagementValidationError(
        "Engagement number must be at most 64 characters.",
      );
    }
    return new EngagementNumber(value);
  }
  static generate(now: Date = new Date()): EngagementNumber {
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return EngagementNumber.create(`ENG-${stamp}-${rand}`);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: EngagementNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
