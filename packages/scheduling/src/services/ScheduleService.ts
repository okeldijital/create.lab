import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import { Schedule } from "../aggregates/Schedule/Schedule.js";
import type { CreateScheduleProps } from "../aggregates/Schedule/Schedule.js";
import {
  CalendarNotFoundError,
  ScheduleNotFoundError,
} from "../errors/SchedulingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ScheduleLifecyclePolicy } from "../policies/ScheduleLifecyclePolicy.js";
import type { CalendarRepository } from "../repositories/CalendarRepository.js";
import type { ScheduleRepository } from "../repositories/ScheduleRepository.js";
import type { ScheduleId } from "../types/ids.js";

export type ScheduleServiceDeps = {
  scheduleRepository: ScheduleRepository;
  calendarRepository: CalendarRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class ScheduleService {
  constructor(private readonly deps: ScheduleServiceDeps) {}

  async create(props: CreateScheduleProps): Promise<Schedule> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const calendar = await this.deps.calendarRepository.findById(
      props.calendarId,
    );
    if (!calendar) {
      throw new CalendarNotFoundError(props.calendarId);
    }
    if (calendar.organizationId !== props.organizationId) {
      throw new CalendarNotFoundError(
        "Calendar does not belong to the organization.",
      );
    }

    const existing = await this.deps.scheduleRepository.findByOrganization(
      props.organizationId,
    );
    ScheduleLifecyclePolicy.assertNoOverlappingPurpose(existing, {
      purpose: props.purpose?.trim() || null,
      effectiveFrom: props.effectiveFrom ?? props.now ?? new Date(),
      effectiveTo: props.effectiveTo ?? null,
    });

    const schedule = Schedule.create({
      ...props,
      timezone: props.timezone ?? calendar.timezone.value,
    });
    await this.deps.scheduleRepository.save(schedule);
    await this.deps.eventPublisher.publish(schedule.pullDomainEvents());
    return schedule;
  }

  async getById(id: ScheduleId): Promise<Schedule> {
    const schedule = await this.deps.scheduleRepository.findById(id);
    if (!schedule) throw new ScheduleNotFoundError(id);
    return schedule;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Schedule[]> {
    return this.deps.scheduleRepository.findByOrganization(organizationId);
  }

  async archive(id: ScheduleId, now?: Date): Promise<Schedule> {
    const schedule = await this.getById(id);
    schedule.archive(now);
    await this.deps.scheduleRepository.archive(id);
    await this.deps.eventPublisher.publish(schedule.pullDomainEvents());
    return schedule;
  }
}
