import { ValueObject } from "@creative-lab/core";
import { InvalidVersionError } from "../errors/AssetErrors.js";

export class VersionNumber extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }
  static create(value: number): VersionNumber {
    if (!Number.isInteger(value) || value < 1) {
      throw new InvalidVersionError(
        `Version number must be an integer ≥ 1 (received ${value}).`,
      );
    }
    return new VersionNumber(value);
  }
  static first(): VersionNumber {
    return VersionNumber.create(1);
  }
  next(): VersionNumber {
    return VersionNumber.create(this.props.value + 1);
  }
  get value(): number {
    return this.props.value;
  }
  override equals(other: VersionNumber | null | undefined): boolean {
    return super.equals(other);
  }
}
