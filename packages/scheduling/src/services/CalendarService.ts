import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import { Calendar } from "../aggregates/Calendar/Calendar.js";
import type { CreateCalendarProps } from "../aggregates/Calendar/Calendar.js";
import {
  CalendarNotFoundError,
  DuplicateCalendarNameError,
} from "../errors/SchedulingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import type { CalendarRepository } from "../repositories/CalendarRepository.js";
import type { CalendarId } from "../types/ids.js";

export type CalendarServiceDeps = {
  calendarRepository: CalendarRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class CalendarService {
  constructor(private readonly deps: CalendarServiceDeps) {}

  async create(props: CreateCalendarProps): Promise<Calendar> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    if (
      await this.deps.calendarRepository.findByName(
        props.organizationId,
        props.name.trim(),
      )
    ) {
      throw new DuplicateCalendarNameError(
        props.name.trim(),
        props.organizationId,
      );
    }
    const calendar = Calendar.create(props);
    await this.deps.calendarRepository.save(calendar);
    await this.deps.eventPublisher.publish(calendar.pullDomainEvents());
    return calendar;
  }

  async getById(id: CalendarId): Promise<Calendar> {
    const calendar = await this.deps.calendarRepository.findById(id);
    if (!calendar) throw new CalendarNotFoundError(id);
    return calendar;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Calendar[]> {
    return this.deps.calendarRepository.findByOrganization(organizationId);
  }

  async archive(id: CalendarId, now?: Date): Promise<Calendar> {
    const calendar = await this.getById(id);
    calendar.archive(now);
    await this.deps.calendarRepository.archive(id);
    await this.deps.eventPublisher.publish(calendar.pullDomainEvents());
    return calendar;
  }
}
