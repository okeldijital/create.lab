import { ValueObject } from "@creative-lab/core";
import { AllocationValidationError } from "../errors/AllocationErrors.js";

export class ReservationPeriod extends ValueObject<{
  from: Date;
  until: Date;
}> {
  private constructor(from: Date, until: Date) {
    super({ from, until });
  }
  static create(from: Date, until: Date): ReservationPeriod {
    const f = new Date(from);
    const u = new Date(until);
    if (Number.isNaN(f.getTime()) || Number.isNaN(u.getTime())) {
      throw new AllocationValidationError(
        "Reservation period requires valid dates.",
      );
    }
    if (u.getTime() <= f.getTime()) {
      throw new AllocationValidationError(
        "Reservation reservedUntil must be after reservedFrom.",
      );
    }
    return new ReservationPeriod(f, u);
  }
  get from(): Date {
    return new Date(this.props.from);
  }
  get until(): Date {
    return new Date(this.props.until);
  }
  overlaps(other: ReservationPeriod): boolean {
    return (
      this.props.from.getTime() < other.props.until.getTime() &&
      other.props.from.getTime() < this.props.until.getTime()
    );
  }
  override equals(other: ReservationPeriod | null | undefined): boolean {
    return super.equals(other);
  }
}
