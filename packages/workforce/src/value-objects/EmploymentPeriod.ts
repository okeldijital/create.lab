import { ValueObject } from "@creative-lab/core";
import { InvalidEmploymentPeriodError } from "../errors/WorkforceErrors.js";
import { isBeforeDay, startOfUtcDay } from "../utils/dates.js";

export class EmploymentPeriod extends ValueObject<{ startDate: Date; endDate: Date | null }> {
  private constructor(startDate: Date, endDate: Date | null) {
    super({ startDate, endDate });
  }

  static create(startDate: Date, endDate: Date | null = null): EmploymentPeriod {
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new InvalidEmploymentPeriodError("Start date is invalid.");
    }
    const start = startOfUtcDay(startDate);
    let end: Date | null = null;
    if (endDate !== null && endDate !== undefined) {
      if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
        throw new InvalidEmploymentPeriodError("End date is invalid.");
      }
      end = startOfUtcDay(endDate);
      if (isBeforeDay(end, start)) {
        throw new InvalidEmploymentPeriodError(
          "End date cannot precede start date.",
        );
      }
    }
    return new EmploymentPeriod(start, end);
  }

  get startDate(): Date {
    return new Date(this.props.startDate);
  }
  get endDate(): Date | null {
    return this.props.endDate ? new Date(this.props.endDate) : null;
  }
  get isOpenEnded(): boolean {
    return this.props.endDate === null;
  }

  includes(date: Date): boolean {
    const d = startOfUtcDay(date).getTime();
    const start = this.props.startDate.getTime();
    const end = this.props.endDate?.getTime() ?? Number.POSITIVE_INFINITY;
    return d >= start && d <= end;
  }

  override equals(other: EmploymentPeriod | null | undefined): boolean {
    return super.equals(other);
  }
}
