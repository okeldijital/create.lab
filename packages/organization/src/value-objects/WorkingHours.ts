import { ValueObject } from "@creative-lab/core";
import { OrganizationSettingsValidationError } from "../errors/SettingsErrors.js";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(time: string): number {
  const match = TIME_PATTERN.exec(time);
  if (!match) {
    throw new OrganizationSettingsValidationError(
      `Invalid time format (expected HH:mm): ${time}`,
    );
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

/**
 * Immutable working-hours window (local wall-clock, HH:mm, 24h).
 */
export class WorkingHours extends ValueObject<{ start: string; end: string }> {
  private constructor(start: string, end: string) {
    super({ start, end });
  }

  static create(start: string, end: string): WorkingHours {
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    if (startMin >= endMin) {
      throw new OrganizationSettingsValidationError(
        "Working hours start must be before end.",
      );
    }
    return new WorkingHours(start, end);
  }

  static defaultNineToFive(): WorkingHours {
    return WorkingHours.create("09:00", "17:00");
  }

  get start(): string {
    return this.props.start;
  }

  get end(): string {
    return this.props.end;
  }

  override equals(other: WorkingHours | null | undefined): boolean {
    return super.equals(other);
  }
}
