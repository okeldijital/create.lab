import { ValueObject } from "@creative-lab/core";
import { InvalidCapacityQuantityError } from "../errors/CapacityErrors.js";
import type { CapacityUnit } from "../enums/CapacityUnit.js";
import { CapacityUnit as CapacityUnitEnum } from "../enums/CapacityUnit.js";

export class CapacityQuantity extends ValueObject<{
  quantity: number;
  unit: CapacityUnit;
}> {
  private constructor(quantity: number, unit: CapacityUnit) {
    super({ quantity, unit });
  }

  static create(quantity: number, unit: CapacityUnit): CapacityQuantity {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new InvalidCapacityQuantityError(
        `Capacity quantity must be greater than zero (received ${quantity}).`,
      );
    }
    if (!Object.values(CapacityUnitEnum).includes(unit)) {
      throw new InvalidCapacityQuantityError(
        `Invalid capacity unit: ${String(unit)}`,
      );
    }
    return new CapacityQuantity(quantity, unit);
  }

  get quantity(): number {
    return this.props.quantity;
  }
  get unit(): CapacityUnit {
    return this.props.unit;
  }

  override equals(other: CapacityQuantity | null | undefined): boolean {
    return super.equals(other);
  }
}
