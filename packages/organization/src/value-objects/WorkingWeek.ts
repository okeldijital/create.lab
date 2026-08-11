import { ValueObject } from "@creative-lab/core";
import { OrganizationSettingsValidationError } from "../errors/SettingsErrors.js";

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

const ALL_WEEKDAYS = new Set<string>(Object.values(Weekday));

/**
 * Immutable set of working weekdays for an organization.
 */
export class WorkingWeek extends ValueObject<{ days: readonly Weekday[] }> {
  private constructor(days: readonly Weekday[]) {
    super({ days: Object.freeze([...days]) });
  }

  static create(days: readonly Weekday[]): WorkingWeek {
    if (!Array.isArray(days) || days.length === 0) {
      throw new OrganizationSettingsValidationError(
        "Working week must include at least one weekday.",
      );
    }
    const unique = new Set<Weekday>();
    for (const day of days) {
      if (!ALL_WEEKDAYS.has(day)) {
        throw new OrganizationSettingsValidationError(
          `Invalid weekday: ${String(day)}`,
        );
      }
      unique.add(day);
    }
    const ordered = Object.values(Weekday).filter((d) => unique.has(d));
    return new WorkingWeek(ordered);
  }

  static defaultMondayToFriday(): WorkingWeek {
    return WorkingWeek.create([
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

  override equals(other: WorkingWeek | null | undefined): boolean {
    return super.equals(other);
  }
}
