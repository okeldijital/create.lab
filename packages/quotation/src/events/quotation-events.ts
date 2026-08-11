import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { QuoteStatus } from "../enums/QuoteStatus.js";
import type { ApprovalStatus } from "../enums/ApprovalStatus.js";
import type {
  QuoteApprovalId,
  QuoteId,
  QuoteLineId,
  QuoteVersionId,
} from "../types/ids.js";

export class QuoteCreated extends DomainEvent<
  "QuoteCreated",
  Readonly<{
    quoteId: string;
    quoteNumber: string;
    customerId: string;
    status: QuoteStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    quoteId: QuoteId;
    quoteNumber: string;
    customerId: string;
    status: QuoteStatus;
    occurredAt?: Date;
  }): QuoteCreated {
    return new QuoteCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.quoteId,
      organizationId: input.organizationId,
      payload: {
        quoteId: input.quoteId,
        quoteNumber: input.quoteNumber,
        customerId: input.customerId,
        status: input.status,
      },
    });
  }
}

export class QuoteIssued extends DomainEvent<
  "QuoteIssued",
  Readonly<{ quoteId: string; versionId: string }>
> {
  static create(input: {
    organizationId: string;
    quoteId: QuoteId;
    versionId: QuoteVersionId;
    occurredAt?: Date;
  }): QuoteIssued {
    return new QuoteIssued({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteIssued",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.quoteId,
      organizationId: input.organizationId,
      payload: {
        quoteId: input.quoteId,
        versionId: input.versionId,
      },
    });
  }
}

export class QuoteAccepted extends DomainEvent<
  "QuoteAccepted",
  Readonly<{ quoteId: string }>
> {
  static create(input: {
    organizationId: string;
    quoteId: QuoteId;
    occurredAt?: Date;
  }): QuoteAccepted {
    return new QuoteAccepted({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteAccepted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.quoteId,
      organizationId: input.organizationId,
      payload: { quoteId: input.quoteId },
    });
  }
}

export class QuoteDeclined extends DomainEvent<
  "QuoteDeclined",
  Readonly<{ quoteId: string }>
> {
  static create(input: {
    organizationId: string;
    quoteId: QuoteId;
    occurredAt?: Date;
  }): QuoteDeclined {
    return new QuoteDeclined({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteDeclined",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.quoteId,
      organizationId: input.organizationId,
      payload: { quoteId: input.quoteId },
    });
  }
}

export class QuoteExpired extends DomainEvent<
  "QuoteExpired",
  Readonly<{ quoteId: string }>
> {
  static create(input: {
    organizationId: string;
    quoteId: QuoteId;
    occurredAt?: Date;
  }): QuoteExpired {
    return new QuoteExpired({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteExpired",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.quoteId,
      organizationId: input.organizationId,
      payload: { quoteId: input.quoteId },
    });
  }
}

export class QuoteArchived extends DomainEvent<
  "QuoteArchived",
  Readonly<{ quoteId: string }>
> {
  static create(input: {
    organizationId: string;
    quoteId: QuoteId;
    occurredAt?: Date;
  }): QuoteArchived {
    return new QuoteArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.quoteId,
      organizationId: input.organizationId,
      payload: { quoteId: input.quoteId },
    });
  }
}

export class QuoteVersionCreated extends DomainEvent<
  "QuoteVersionCreated",
  Readonly<{
    versionId: string;
    quoteId: string;
    versionNumber: number;
  }>
> {
  static create(input: {
    organizationId: string;
    versionId: QuoteVersionId;
    quoteId: QuoteId;
    versionNumber: number;
    occurredAt?: Date;
  }): QuoteVersionCreated {
    return new QuoteVersionCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteVersionCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.versionId,
      organizationId: input.organizationId,
      payload: {
        versionId: input.versionId,
        quoteId: input.quoteId,
        versionNumber: input.versionNumber,
      },
    });
  }
}

export class QuoteVersionPromoted extends DomainEvent<
  "QuoteVersionPromoted",
  Readonly<{
    versionId: string;
    quoteId: string;
    previousVersionId: string | null;
  }>
> {
  static create(input: {
    organizationId: string;
    versionId: QuoteVersionId;
    quoteId: QuoteId;
    previousVersionId: QuoteVersionId | null;
    occurredAt?: Date;
  }): QuoteVersionPromoted {
    return new QuoteVersionPromoted({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteVersionPromoted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.versionId,
      organizationId: input.organizationId,
      payload: {
        versionId: input.versionId,
        quoteId: input.quoteId,
        previousVersionId: input.previousVersionId,
      },
    });
  }
}

export class QuoteLineAdded extends DomainEvent<
  "QuoteLineAdded",
  Readonly<{
    lineId: string;
    versionId: string;
    serviceId: string;
  }>
> {
  static create(input: {
    organizationId: string;
    lineId: QuoteLineId;
    versionId: QuoteVersionId;
    serviceId: string;
    occurredAt?: Date;
  }): QuoteLineAdded {
    return new QuoteLineAdded({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteLineAdded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.lineId,
      organizationId: input.organizationId,
      payload: {
        lineId: input.lineId,
        versionId: input.versionId,
        serviceId: input.serviceId,
      },
    });
  }
}

export class QuoteLineRemoved extends DomainEvent<
  "QuoteLineRemoved",
  Readonly<{ lineId: string; versionId: string }>
> {
  static create(input: {
    organizationId: string;
    lineId: QuoteLineId;
    versionId: QuoteVersionId;
    occurredAt?: Date;
  }): QuoteLineRemoved {
    return new QuoteLineRemoved({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteLineRemoved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.lineId,
      organizationId: input.organizationId,
      payload: {
        lineId: input.lineId,
        versionId: input.versionId,
      },
    });
  }
}

export class QuoteApprovalRecorded extends DomainEvent<
  "QuoteApprovalRecorded",
  Readonly<{
    approvalId: string;
    quoteId: string;
    decision: ApprovalStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    approvalId: QuoteApprovalId;
    quoteId: QuoteId;
    decision: ApprovalStatus;
    occurredAt?: Date;
  }): QuoteApprovalRecorded {
    return new QuoteApprovalRecorded({
      eventId: DomainEvent.nextEventId(),
      eventType: "QuoteApprovalRecorded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.approvalId,
      organizationId: input.organizationId,
      payload: {
        approvalId: input.approvalId,
        quoteId: input.quoteId,
        decision: input.decision,
      },
    });
  }
}
