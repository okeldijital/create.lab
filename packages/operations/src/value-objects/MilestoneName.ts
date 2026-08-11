import { ValueObject } from "@creative-lab/core";
import { OperationsValidationError } from "../errors/OperationsErrors.js";

export class MilestoneName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(raw: string): MilestoneName {
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      throw new OperationsValidationError("Milestone name is required.");
    }
    if (value.length > 150) {
      throw new OperationsValidationError(
        "Milestone name must be at most 150 characters.",
      );
    }
    return new MilestoneName(value);
  }
  get value(): string {
    return this.props.value;
  }
  override equals(other: MilestoneName | null | undefined): boolean {
    if (other == null || !(other instanceof MilestoneName)) return false;
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
