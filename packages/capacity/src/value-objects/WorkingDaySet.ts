import { ValueObject } from "@creative-lab/core";
import { InvalidAvailabilityProfileError } from "../errors/CapacityErrors.js";

export const Weekday = {
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY",
} as const;

export type Weekday = (typeof Weekday)[keyof typeof Weekday];

const ALL = new Set<string>(Object.values(Weekday));

export class WorkingDaySet extends ValueObject<{ days: readonly Weekday[] }> {
  private constructor(days: readonly Weekday[]) {
    super({ days: Object.freeze([...days]) as readonly Weekday[] });
  }

  static create(days: readonly Weekday[]): WorkingDaySet {
    if (!Array.isArray(days) || days.length === 0) {
      throw new InvalidAvailabilityProfileError(
        "Working day set must include at least one weekday.",
      );
    }
    const unique = new Set<Weekday>();
    for (const day of days) {
      if (!ALL.has(day)) {
        throw new InvalidAvailabilityProfileError(
          `Invalid weekday: ${String(day)}`,
        );
      }
      unique.add(day);
    }
    const ordered = Object.values(Weekday).filter((d) => unique.has(d));
    return new WorkingDaySet(ordered);
  }

  static mondayToFriday(): WorkingDaySet {
    return WorkingDaySet.create([
      Weekday.MONDAY,
      Weekday.TUESDAY,
      Weekday.WEDNESDAY,
      Weekday.THURSDAY,
      Weekday.FRIDAY,
    ]);
  }

  get days(): readonly Weekday[] {
    return this.props.days;
  }

  includes(day: Weekday): boolean {
    return this.props.days.includes(day);
  }

  override equals(other: WorkingDaySet | null | undefined): boolean {
    return super.equals(other);
  }
}
