import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  WorkingPattern,
  WorkingPatternId,
  WorkingPatternRepository,
} from "@creative-lab/capacity";
import {
  Organization,
  type OrganizationId,
  type OrganizationRepository,
  type OrganizationSlug,
} from "@creative-lab/organization";
import type { Booking } from "../../aggregates/Booking/Booking.js";
import type { Calendar } from "../../aggregates/Calendar/Calendar.js";
import type { Schedule } from "../../aggregates/Schedule/Schedule.js";
import type { Shift } from "../../aggregates/Shift/Shift.js";
import type { TimeBlock } from "../../aggregates/TimeBlock/TimeBlock.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { BookingRepository } from "../../repositories/BookingRepository.js";
import type { CalendarRepository } from "../../repositories/CalendarRepository.js";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.js";
import type { ShiftRepository } from "../../repositories/ShiftRepository.js";
import type { TimeBlockRepository } from "../../repositories/TimeBlockRepository.js";
import type {
  BookingId,
  CalendarId,
  ScheduleId,
  ShiftId,
  TimeBlockId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const v = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === v) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryWorkingPatternRepository
  implements WorkingPatternRepository
{
  private readonly byId = new Map<string, WorkingPattern>();
  async findById(id: WorkingPatternId): Promise<WorkingPattern | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkingPattern[]> {
    return [...this.byId.values()].filter(
      (p) => p.organizationId === organizationId,
    );
  }
  async findAll(): Promise<WorkingPattern[]> {
    return [...this.byId.values()];
  }
  async save(pattern: WorkingPattern): Promise<void> {
    this.byId.set(pattern.id, pattern);
  }
  async update(pattern: WorkingPattern): Promise<void> {
    this.byId.set(pattern.id, pattern);
  }
  async archive(id: WorkingPatternId): Promise<void> {
    void id;
  }
  async exists(id: WorkingPatternId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryCalendarRepository implements CalendarRepository {
  private readonly byId = new Map<string, Calendar>();
  async findById(id: CalendarId): Promise<Calendar | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Calendar[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByName(
    organizationId: OrganizationId,
    name: string,
  ): Promise<Calendar | null> {
    const t = name.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (c) =>
          c.organizationId === organizationId &&
          c.name.value.toLowerCase() === t,
      ) ?? null
    );
  }
  async findAll(): Promise<Calendar[]> {
    return [...this.byId.values()];
  }
  async save(calendar: Calendar): Promise<void> {
    this.byId.set(calendar.id, calendar);
  }
  async update(calendar: Calendar): Promise<void> {
    this.byId.set(calendar.id, calendar);
  }
  async archive(id: CalendarId): Promise<void> {
    void id;
  }
  async exists(id: CalendarId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryScheduleRepository implements ScheduleRepository {
  private readonly byId = new Map<string, Schedule>();
  async findById(id: ScheduleId): Promise<Schedule | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Schedule[]> {
    return [...this.byId.values()].filter(
      (s) => s.organizationId === organizationId,
    );
  }
  async findByCalendar(calendarId: CalendarId): Promise<Schedule[]> {
    return [...this.byId.values()].filter((s) => s.calendarId === calendarId);
  }
  async findAll(): Promise<Schedule[]> {
    return [...this.byId.values()];
  }
  async save(schedule: Schedule): Promise<void> {
    this.byId.set(schedule.id, schedule);
  }
  async update(schedule: Schedule): Promise<void> {
    this.byId.set(schedule.id, schedule);
  }
  async archive(id: ScheduleId): Promise<void> {
    void id;
  }
  async exists(id: ScheduleId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryTimeBlockRepository implements TimeBlockRepository {
  private readonly byId = new Map<string, TimeBlock>();
  async findById(id: TimeBlockId): Promise<TimeBlock | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<TimeBlock[]> {
    return [...this.byId.values()].filter(
      (b) => b.organizationId === organizationId,
    );
  }
  async findBySchedule(scheduleId: ScheduleId): Promise<TimeBlock[]> {
    return [...this.byId.values()].filter((b) => b.scheduleId === scheduleId);
  }
  async findAll(): Promise<TimeBlock[]> {
    return [...this.byId.values()];
  }
  async save(block: TimeBlock): Promise<void> {
    this.byId.set(block.id, block);
  }
  async update(block: TimeBlock): Promise<void> {
    this.byId.set(block.id, block);
  }
  async archive(id: TimeBlockId): Promise<void> {
    void id;
  }
  async exists(id: TimeBlockId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryBookingRepository implements BookingRepository {
  private readonly byId = new Map<string, Booking>();
  async findById(id: BookingId): Promise<Booking | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Booking[]> {
    return [...this.byId.values()].filter(
      (b) => b.organizationId === organizationId,
    );
  }
  async findBySchedule(scheduleId: ScheduleId): Promise<Booking[]> {
    return [...this.byId.values()].filter((b) => b.scheduleId === scheduleId);
  }
  async findByTimeBlock(timeBlockId: TimeBlockId): Promise<Booking[]> {
    return [...this.byId.values()].filter(
      (b) => b.timeBlockId === timeBlockId,
    );
  }
  async findAll(): Promise<Booking[]> {
    return [...this.byId.values()];
  }
  async save(booking: Booking): Promise<void> {
    this.byId.set(booking.id, booking);
  }
  async update(booking: Booking): Promise<void> {
    this.byId.set(booking.id, booking);
  }
  async archive(id: BookingId): Promise<void> {
    void id;
  }
  async exists(id: BookingId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryShiftRepository implements ShiftRepository {
  private readonly byId = new Map<string, Shift>();
  async findById(id: ShiftId): Promise<Shift | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(organizationId: OrganizationId): Promise<Shift[]> {
    return [...this.byId.values()].filter(
      (s) => s.organizationId === organizationId,
    );
  }
  async findAll(): Promise<Shift[]> {
    return [...this.byId.values()];
  }
  async save(shift: Shift): Promise<void> {
    this.byId.set(shift.id, shift);
  }
  async update(shift: Shift): Promise<void> {
    this.byId.set(shift.id, shift);
  }
  async archive(id: ShiftId): Promise<void> {
    void id;
  }
  async exists(id: ShiftId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export async function seedOrganization(
  orgs: InMemoryOrganizationRepository,
): Promise<Organization> {
  const organization = Organization.create({
    name: "Acme Scheduling",
    slug: "acme-sched",
  });
  organization.pullDomainEvents();
  await orgs.save(organization);
  return organization;
}
