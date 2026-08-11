import { ValueObject } from "@creative-lab/core";
import { AllocationPriority as AllocationPriorityEnum } from "../enums/AllocationPriority.js";
import { AllocationValidationError } from "../errors/AllocationErrors.js";

export class AllocationPriorityVO extends ValueObject<{
  value: AllocationPriorityEnum;
}> {
  private constructor(value: AllocationPriorityEnum) {
    super({ value });
  }
  static create(
    value: AllocationPriorityEnum = AllocationPriorityEnum.NORMAL,
  ): AllocationPriorityVO {
    if (!Object.values(AllocationPriorityEnum).includes(value)) {
      throw new AllocationValidationError(
        `Invalid allocation priority: ${String(value)}`,
      );
    }
    return new AllocationPriorityVO(value);
  }
  get value(): AllocationPriorityEnum {
    return this.props.value;
  }
  override equals(other: AllocationPriorityVO | null | undefined): boolean {
    return super.equals(other);
  }
}

/** Spec name alias */
export { AllocationPriorityVO as AllocationPriority };
