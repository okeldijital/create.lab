import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { ServiceStatus } from "../enums/ServiceStatus.js";
import type { PriceBookStatus } from "../enums/PriceBookStatus.js";
import type {
  PriceBookId,
  PriceRuleId,
  ServiceCategoryId,
  ServiceId,
} from "../types/ids.js";

export class ServiceCreated extends DomainEvent<
  "ServiceCreated",
  Readonly<{
    serviceId: string;
    serviceCode: string;
    name: string;
    status: ServiceStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    serviceId: ServiceId;
    serviceCode: string;
    name: string;
    status: ServiceStatus;
    occurredAt?: Date;
  }): ServiceCreated {
    return new ServiceCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ServiceCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.serviceId,
      organizationId: input.organizationId,
      payload: {
        serviceId: input.serviceId,
        serviceCode: input.serviceCode,
        name: input.name,
        status: input.status,
      },
    });
  }
}

export class ServiceActivated extends DomainEvent<
  "ServiceActivated",
  Readonly<{ serviceId: string }>
> {
  static create(input: {
    organizationId: string;
    serviceId: ServiceId;
    occurredAt?: Date;
  }): ServiceActivated {
    return new ServiceActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ServiceActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.serviceId,
      organizationId: input.organizationId,
      payload: { serviceId: input.serviceId },
    });
  }
}

export class ServiceArchived extends DomainEvent<
  "ServiceArchived",
  Readonly<{ serviceId: string }>
> {
  static create(input: {
    organizationId: string;
    serviceId: ServiceId;
    occurredAt?: Date;
  }): ServiceArchived {
    return new ServiceArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "ServiceArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.serviceId,
      organizationId: input.organizationId,
      payload: { serviceId: input.serviceId },
    });
  }
}

export class CategoryCreated extends DomainEvent<
  "CategoryCreated",
  Readonly<{ categoryId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    categoryId: ServiceCategoryId;
    name: string;
    occurredAt?: Date;
  }): CategoryCreated {
    return new CategoryCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "CategoryCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.categoryId,
      organizationId: input.organizationId,
      payload: {
        categoryId: input.categoryId,
        name: input.name,
      },
    });
  }
}

export class CategoryArchived extends DomainEvent<
  "CategoryArchived",
  Readonly<{ categoryId: string }>
> {
  static create(input: {
    organizationId: string;
    categoryId: ServiceCategoryId;
    occurredAt?: Date;
  }): CategoryArchived {
    return new CategoryArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "CategoryArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.categoryId,
      organizationId: input.organizationId,
      payload: { categoryId: input.categoryId },
    });
  }
}

export class PriceBookCreated extends DomainEvent<
  "PriceBookCreated",
  Readonly<{
    priceBookId: string;
    name: string;
    currency: string;
    status: PriceBookStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    priceBookId: PriceBookId;
    name: string;
    currency: string;
    status: PriceBookStatus;
    occurredAt?: Date;
  }): PriceBookCreated {
    return new PriceBookCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PriceBookCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.priceBookId,
      organizationId: input.organizationId,
      payload: {
        priceBookId: input.priceBookId,
        name: input.name,
        currency: input.currency,
        status: input.status,
      },
    });
  }
}

export class PriceBookPublished extends DomainEvent<
  "PriceBookPublished",
  Readonly<{ priceBookId: string; currency: string }>
> {
  static create(input: {
    organizationId: string;
    priceBookId: PriceBookId;
    currency: string;
    occurredAt?: Date;
  }): PriceBookPublished {
    return new PriceBookPublished({
      eventId: DomainEvent.nextEventId(),
      eventType: "PriceBookPublished",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.priceBookId,
      organizationId: input.organizationId,
      payload: {
        priceBookId: input.priceBookId,
        currency: input.currency,
      },
    });
  }
}

export class PriceBookRetired extends DomainEvent<
  "PriceBookRetired",
  Readonly<{ priceBookId: string }>
> {
  static create(input: {
    organizationId: string;
    priceBookId: PriceBookId;
    occurredAt?: Date;
  }): PriceBookRetired {
    return new PriceBookRetired({
      eventId: DomainEvent.nextEventId(),
      eventType: "PriceBookRetired",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.priceBookId,
      organizationId: input.organizationId,
      payload: { priceBookId: input.priceBookId },
    });
  }
}

export class PriceRuleCreated extends DomainEvent<
  "PriceRuleCreated",
  Readonly<{
    priceRuleId: string;
    priceBookId: string;
    serviceId: string;
    basePriceMinor: number;
  }>
> {
  static create(input: {
    organizationId: string;
    priceRuleId: PriceRuleId;
    priceBookId: PriceBookId;
    serviceId: ServiceId;
    basePriceMinor: number;
    occurredAt?: Date;
  }): PriceRuleCreated {
    return new PriceRuleCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PriceRuleCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.priceRuleId,
      organizationId: input.organizationId,
      payload: {
        priceRuleId: input.priceRuleId,
        priceBookId: input.priceBookId,
        serviceId: input.serviceId,
        basePriceMinor: input.basePriceMinor,
      },
    });
  }
}

export class PriceRuleUpdated extends DomainEvent<
  "PriceRuleUpdated",
  Readonly<{
    priceRuleId: string;
    basePriceMinor: number;
    minimumPriceMinor: number;
    maximumPriceMinor: number;
  }>
> {
  static create(input: {
    organizationId: string;
    priceRuleId: PriceRuleId;
    basePriceMinor: number;
    minimumPriceMinor: number;
    maximumPriceMinor: number;
    occurredAt?: Date;
  }): PriceRuleUpdated {
    return new PriceRuleUpdated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PriceRuleUpdated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.priceRuleId,
      organizationId: input.organizationId,
      payload: {
        priceRuleId: input.priceRuleId,
        basePriceMinor: input.basePriceMinor,
        minimumPriceMinor: input.minimumPriceMinor,
        maximumPriceMinor: input.maximumPriceMinor,
      },
    });
  }
}

export class PriceRuleArchived extends DomainEvent<
  "PriceRuleArchived",
  Readonly<{ priceRuleId: string }>
> {
  static create(input: {
    organizationId: string;
    priceRuleId: PriceRuleId;
    occurredAt?: Date;
  }): PriceRuleArchived {
    return new PriceRuleArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "PriceRuleArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.priceRuleId,
      organizationId: input.organizationId,
      payload: { priceRuleId: input.priceRuleId },
    });
  }
}
