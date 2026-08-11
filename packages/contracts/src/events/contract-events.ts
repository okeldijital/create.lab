import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { ContractStatus } from "../enums/ContractStatus.js";
import type { AmendmentStatus } from "../enums/AmendmentStatus.js";
import type {
  ContractAmendmentId,
  ContractId,
  ContractTermId,
  ContractVersionId,
} from "../types/ids.js";

export class ContractCreated extends DomainEvent<
  "ContractCreated",
  Readonly<{
    contractId: string;
    contractNumber: string;
    customerId: string;
    quotationId: string;
    status: ContractStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    contractId: ContractId;
    contractNumber: string;
    customerId: string;
    quotationId: string;
    status: ContractStatus;
    occurredAt?: Date;
  }): ContractCreated {
    return new ContractCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.contractId,
      organizationId: input.organizationId,
      payload: {
        contractId: input.contractId,
        contractNumber: input.contractNumber,
        customerId: input.customerId,
        quotationId: input.quotationId,
        status: input.status,
      },
    });
  }
}

export class ContractActivated extends DomainEvent<
  "ContractActivated",
  Readonly<{ contractId: string }>
> {
  static create(input: {
    organizationId: string;
    contractId: ContractId;
    occurredAt?: Date;
  }): ContractActivated {
    return new ContractActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.contractId,
      organizationId: input.organizationId,
      payload: { contractId: input.contractId },
    });
  }
}

export class ContractExpired extends DomainEvent<
  "ContractExpired",
  Readonly<{ contractId: string }>
> {
  static create(input: {
    organizationId: string;
    contractId: ContractId;
    occurredAt?: Date;
  }): ContractExpired {
    return new ContractExpired({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractExpired",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.contractId,
      organizationId: input.organizationId,
      payload: { contractId: input.contractId },
    });
  }
}

export class ContractTerminated extends DomainEvent<
  "ContractTerminated",
  Readonly<{ contractId: string }>
> {
  static create(input: {
    organizationId: string;
    contractId: ContractId;
    occurredAt?: Date;
  }): ContractTerminated {
    return new ContractTerminated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractTerminated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.contractId,
      organizationId: input.organizationId,
      payload: { contractId: input.contractId },
    });
  }
}

export class ContractArchived extends DomainEvent<
  "ContractArchived",
  Readonly<{ contractId: string }>
> {
  static create(input: {
    organizationId: string;
    contractId: ContractId;
    occurredAt?: Date;
  }): ContractArchived {
    return new ContractArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.contractId,
      organizationId: input.organizationId,
      payload: { contractId: input.contractId },
    });
  }
}

export class ContractVersionCreated extends DomainEvent<
  "ContractVersionCreated",
  Readonly<{
    versionId: string;
    contractId: string;
    versionNumber: number;
  }>
> {
  static create(input: {
    organizationId: string;
    versionId: ContractVersionId;
    contractId: ContractId;
    versionNumber: number;
    occurredAt?: Date;
  }): ContractVersionCreated {
    return new ContractVersionCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractVersionCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.versionId,
      organizationId: input.organizationId,
      payload: {
        versionId: input.versionId,
        contractId: input.contractId,
        versionNumber: input.versionNumber,
      },
    });
  }
}

export class ContractVersionPromoted extends DomainEvent<
  "ContractVersionPromoted",
  Readonly<{
    versionId: string;
    contractId: string;
    previousVersionId: string | null;
  }>
> {
  static create(input: {
    organizationId: string;
    versionId: ContractVersionId;
    contractId: ContractId;
    previousVersionId: ContractVersionId | null;
    occurredAt?: Date;
  }): ContractVersionPromoted {
    return new ContractVersionPromoted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractVersionPromoted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.versionId,
      organizationId: input.organizationId,
      payload: {
        versionId: input.versionId,
        contractId: input.contractId,
        previousVersionId: input.previousVersionId,
      },
    });
  }
}

export class ContractTermAdded extends DomainEvent<
  "ContractTermAdded",
  Readonly<{
    termId: string;
    versionId: string;
    title: string;
    order: number;
  }>
> {
  static create(input: {
    organizationId: string;
    termId: ContractTermId;
    versionId: ContractVersionId;
    title: string;
    order: number;
    occurredAt?: Date;
  }): ContractTermAdded {
    return new ContractTermAdded({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractTermAdded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.termId,
      organizationId: input.organizationId,
      payload: {
        termId: input.termId,
        versionId: input.versionId,
        title: input.title,
        order: input.order,
      },
    });
  }
}

export class ContractTermRemoved extends DomainEvent<
  "ContractTermRemoved",
  Readonly<{ termId: string; versionId: string }>
> {
  static create(input: {
    organizationId: string;
    termId: ContractTermId;
    versionId: ContractVersionId;
    occurredAt?: Date;
  }): ContractTermRemoved {
    return new ContractTermRemoved({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractTermRemoved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.termId,
      organizationId: input.organizationId,
      payload: {
        termId: input.termId,
        versionId: input.versionId,
      },
    });
  }
}

export class ContractAmendmentCreated extends DomainEvent<
  "ContractAmendmentCreated",
  Readonly<{
    amendmentId: string;
    contractId: string;
    status: AmendmentStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    amendmentId: ContractAmendmentId;
    contractId: ContractId;
    status: AmendmentStatus;
    occurredAt?: Date;
  }): ContractAmendmentCreated {
    return new ContractAmendmentCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractAmendmentCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.amendmentId,
      organizationId: input.organizationId,
      payload: {
        amendmentId: input.amendmentId,
        contractId: input.contractId,
        status: input.status,
      },
    });
  }
}

export class ContractAmendmentApproved extends DomainEvent<
  "ContractAmendmentApproved",
  Readonly<{ amendmentId: string; contractId: string }>
> {
  static create(input: {
    organizationId: string;
    amendmentId: ContractAmendmentId;
    contractId: ContractId;
    occurredAt?: Date;
  }): ContractAmendmentApproved {
    return new ContractAmendmentApproved({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractAmendmentApproved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.amendmentId,
      organizationId: input.organizationId,
      payload: {
        amendmentId: input.amendmentId,
        contractId: input.contractId,
      },
    });
  }
}

export class ContractAmendmentApplied extends DomainEvent<
  "ContractAmendmentApplied",
  Readonly<{
    amendmentId: string;
    contractId: string;
    newVersionId: string;
  }>
> {
  static create(input: {
    organizationId: string;
    amendmentId: ContractAmendmentId;
    contractId: ContractId;
    newVersionId: ContractVersionId;
    occurredAt?: Date;
  }): ContractAmendmentApplied {
    return new ContractAmendmentApplied({
      eventId: DomainEvent.nextEventId(),
      eventType: "ContractAmendmentApplied",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.amendmentId,
      organizationId: input.organizationId,
      payload: {
        amendmentId: input.amendmentId,
        contractId: input.contractId,
        newVersionId: input.newVersionId,
      },
    });
  }
}
