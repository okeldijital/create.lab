import { ValueObject } from "@creative-lab/core";
import { ProductionPriority as ProductionPriorityEnum } from "../enums/ProductionPriority.js";
import { ProductionValidationError } from "../errors/ProductionErrors.js";

export class ProductionPriorityVO extends ValueObject<{
  value: ProductionPriorityEnum;
}> {
  private constructor(value: ProductionPriorityEnum) {
    super({ value });
  }
  static create(
    value: ProductionPriorityEnum = ProductionPriorityEnum.NORMAL,
  ): ProductionPriorityVO {
    if (!Object.values(ProductionPriorityEnum).includes(value)) {
      throw new ProductionValidationError(
        `Invalid production priority: ${String(value)}`,
      );
    }
    return new ProductionPriorityVO(value);
  }
  get value(): ProductionPriorityEnum {
    return this.props.value;
  }
  override equals(other: ProductionPriorityVO | null | undefined): boolean {
    return super.equals(other);
  }
}
