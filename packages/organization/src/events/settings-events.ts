import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { OrganizationId } from "../types/ids.js";

type SettingsUpdatedPayload = Readonly<{
  timezone: string;
  locale: string;
  currency: string;
  workingWeek: readonly string[];
  workingHours: Readonly<{ start: string; end: string }>;
}>;

export class OrganizationSettingsUpdated extends DomainEvent<
  "OrganizationSettingsUpdated",
  SettingsUpdatedPayload
> {
  static create(input: {
    organizationId: OrganizationId;
    timezone: string;
    locale: string;
    currency: string;
    workingWeek: readonly string[];
    workingHours: Readonly<{ start: string; end: string }>;
    occurredAt?: Date;
  }): OrganizationSettingsUpdated {
    return new OrganizationSettingsUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "OrganizationSettingsUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.organizationId,
      organizationId: input.organizationId,
      payload: {
        timezone: input.timezone,
        locale: input.locale,
        currency: input.currency,
        workingWeek: input.workingWeek,
        workingHours: input.workingHours,
      },
    });
  }
}
