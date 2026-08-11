import { ValueObject } from "@creative-lab/core";
import { CapabilityLevel } from "../enums/CapabilityLevel.js";
import { CapacityProfileValidationError } from "../errors/CapacityErrors.js";

export class ProficiencyLevel extends ValueObject<{
  level: CapabilityLevel;
}> {
  private constructor(level: CapabilityLevel) {
    super({ level });
  }

  static create(level: CapabilityLevel): ProficiencyLevel {
    if (!Object.values(CapabilityLevel).includes(level)) {
      throw new CapacityProfileValidationError(
        `Invalid proficiency level: ${String(level)}`,
      );
    }
    return new ProficiencyLevel(level);
  }

  get level(): CapabilityLevel {
    return this.props.level;
  }

  override equals(other: ProficiencyLevel | null | undefined): boolean {
    return super.equals(other);
  }
}
