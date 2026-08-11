import { ValueObject } from "@creative-lab/core";
import { InvalidAvailabilityProfileError } from "../errors/CapacityErrors.js";

export class Timezone extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(raw: string): Timezone {
    if (typeof raw !== "string") {
      throw new InvalidAvailabilityProfileError("Timezone must be a string.");
    }
    const value = raw.trim();
    if (!value) {
      throw new InvalidAvailabilityProfileError("Timezone is required.");
    }
    if (!/^[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)*$/.test(value)) {
      throw new InvalidAvailabilityProfileError(
        `Invalid timezone identifier: ${raw}`,
      );
    }
    return new Timezone(value);
  }

  get value(): string {
    return this.props.value;
  }

  override equals(other: Timezone | null | undefined): boolean {
    return super.equals(other);
  }
}
