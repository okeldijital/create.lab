import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { InvoiceStatus } from "../enums/InvoiceStatus.js";
import type { PaymentStatus } from "../enums/PaymentStatus.js";
import type { CreditStatus } from "../enums/CreditStatus.js";
import type {
  CreditNoteId,
  InvoiceId,
  PaymentId,
} from "../types/ids.js";

export class InvoiceCreated extends DomainEvent<
  "InvoiceCreated",
  Readonly<{
    invoiceId: string;
    invoiceNumber: string;
    projectId: string;
    deliveryId: string;
    status: InvoiceStatus;
    totalMinor: number;
    currency: string;
  }>
> {
  static create(input: {
    organizationId: string;
    invoiceId: InvoiceId;
    invoiceNumber: string;
    projectId: string;
    deliveryId: string;
    status: InvoiceStatus;
    totalMinor: number;
    currency: string;
    occurredAt?: Date;
  }): InvoiceCreated {
    return new InvoiceCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "InvoiceCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.invoiceId,
      organizationId: input.organizationId,
      payload: {
        invoiceId: input.invoiceId,
        invoiceNumber: input.invoiceNumber,
        projectId: input.projectId,
        deliveryId: input.deliveryId,
        status: input.status,
        totalMinor: input.totalMinor,
        currency: input.currency,
      },
    });
  }
}

export class InvoiceIssued extends DomainEvent<
  "InvoiceIssued",
  Readonly<{ invoiceId: string; issueDate: string }>
> {
  static create(input: {
    organizationId: string;
    invoiceId: InvoiceId;
    issueDate: Date;
    occurredAt?: Date;
  }): InvoiceIssued {
    return new InvoiceIssued({
      eventId: DomainEvent.nextEventId(),
      eventType: "InvoiceIssued",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.invoiceId,
      organizationId: input.organizationId,
      payload: {
        invoiceId: input.invoiceId,
        issueDate: input.issueDate.toISOString(),
      },
    });
  }
}

export class InvoicePaid extends DomainEvent<
  "InvoicePaid",
  Readonly<{ invoiceId: string }>
> {
  static create(input: {
    organizationId: string;
    invoiceId: InvoiceId;
    occurredAt?: Date;
  }): InvoicePaid {
    return new InvoicePaid({
      eventId: DomainEvent.nextEventId(),
      eventType: "InvoicePaid",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.invoiceId,
      organizationId: input.organizationId,
      payload: { invoiceId: input.invoiceId },
    });
  }
}

export class InvoicePartiallyPaid extends DomainEvent<
  "InvoicePartiallyPaid",
  Readonly<{ invoiceId: string; balanceMinor: number }>
> {
  static create(input: {
    organizationId: string;
    invoiceId: InvoiceId;
    balanceMinor: number;
    occurredAt?: Date;
  }): InvoicePartiallyPaid {
    return new InvoicePartiallyPaid({
      eventId: DomainEvent.nextEventId(),
      eventType: "InvoicePartiallyPaid",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.invoiceId,
      organizationId: input.organizationId,
      payload: {
        invoiceId: input.invoiceId,
        balanceMinor: input.balanceMinor,
      },
    });
  }
}

export class InvoiceVoided extends DomainEvent<
  "InvoiceVoided",
  Readonly<{ invoiceId: string }>
> {
  static create(input: {
    organizationId: string;
    invoiceId: InvoiceId;
    occurredAt?: Date;
  }): InvoiceVoided {
    return new InvoiceVoided({
      eventId: DomainEvent.nextEventId(),
      eventType: "InvoiceVoided",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.invoiceId,
      organizationId: input.organizationId,
      payload: { invoiceId: input.invoiceId },
    });
  }
}

export class InvoiceArchived extends DomainEvent<
  "InvoiceArchived",
  Readonly<{ invoiceId: string }>
> {
  static create(input: {
    organizationId: string;
    invoiceId: InvoiceId;
    occurredAt?: Date;
  }): InvoiceArchived {
    return new InvoiceArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "InvoiceArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.invoiceId,
      organizationId: input.organizationId,
      payload: { invoiceId: input.invoiceId },
    });
  }
}

export class PaymentRecorded extends DomainEvent<
  "PaymentRecorded",
  Readonly<{
    paymentId: string;
    invoiceId: string;
    amountMinor: number;
    status: PaymentStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    paymentId: PaymentId;
    invoiceId: InvoiceId;
    amountMinor: number;
    status: PaymentStatus;
    occurredAt?: Date;
  }): PaymentRecorded {
    return new PaymentRecorded({
      eventId: DomainEvent.nextEventId(),
      eventType: "PaymentRecorded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.paymentId,
      organizationId: input.organizationId,
      payload: {
        paymentId: input.paymentId,
        invoiceId: input.invoiceId,
        amountMinor: input.amountMinor,
        status: input.status,
      },
    });
  }
}

export class PaymentCompleted extends DomainEvent<
  "PaymentCompleted",
  Readonly<{ paymentId: string; invoiceId: string }>
> {
  static create(input: {
    organizationId: string;
    paymentId: PaymentId;
    invoiceId: InvoiceId;
    occurredAt?: Date;
  }): PaymentCompleted {
    return new PaymentCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "PaymentCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.paymentId,
      organizationId: input.organizationId,
      payload: {
        paymentId: input.paymentId,
        invoiceId: input.invoiceId,
      },
    });
  }
}

export class PaymentRefunded extends DomainEvent<
  "PaymentRefunded",
  Readonly<{ paymentId: string; invoiceId: string; refundMinor: number }>
> {
  static create(input: {
    organizationId: string;
    paymentId: PaymentId;
    invoiceId: InvoiceId;
    refundMinor: number;
    occurredAt?: Date;
  }): PaymentRefunded {
    return new PaymentRefunded({
      eventId: DomainEvent.nextEventId(),
      eventType: "PaymentRefunded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.paymentId,
      organizationId: input.organizationId,
      payload: {
        paymentId: input.paymentId,
        invoiceId: input.invoiceId,
        refundMinor: input.refundMinor,
      },
    });
  }
}

export class CreditNoteCreated extends DomainEvent<
  "CreditNoteCreated",
  Readonly<{
    creditNoteId: string;
    invoiceId: string;
    amountMinor: number;
    status: CreditStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    creditNoteId: CreditNoteId;
    invoiceId: InvoiceId;
    amountMinor: number;
    status: CreditStatus;
    occurredAt?: Date;
  }): CreditNoteCreated {
    return new CreditNoteCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "CreditNoteCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.creditNoteId,
      organizationId: input.organizationId,
      payload: {
        creditNoteId: input.creditNoteId,
        invoiceId: input.invoiceId,
        amountMinor: input.amountMinor,
        status: input.status,
      },
    });
  }
}

export class CreditNoteIssued extends DomainEvent<
  "CreditNoteIssued",
  Readonly<{ creditNoteId: string; invoiceId: string }>
> {
  static create(input: {
    organizationId: string;
    creditNoteId: CreditNoteId;
    invoiceId: InvoiceId;
    occurredAt?: Date;
  }): CreditNoteIssued {
    return new CreditNoteIssued({
      eventId: DomainEvent.nextEventId(),
      eventType: "CreditNoteIssued",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.creditNoteId,
      organizationId: input.organizationId,
      payload: {
        creditNoteId: input.creditNoteId,
        invoiceId: input.invoiceId,
      },
    });
  }
}

export class CreditNoteApplied extends DomainEvent<
  "CreditNoteApplied",
  Readonly<{ creditNoteId: string; invoiceId: string; amountMinor: number }>
> {
  static create(input: {
    organizationId: string;
    creditNoteId: CreditNoteId;
    invoiceId: InvoiceId;
    amountMinor: number;
    occurredAt?: Date;
  }): CreditNoteApplied {
    return new CreditNoteApplied({
      eventId: DomainEvent.nextEventId(),
      eventType: "CreditNoteApplied",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.creditNoteId,
      organizationId: input.organizationId,
      payload: {
        creditNoteId: input.creditNoteId,
        invoiceId: input.invoiceId,
        amountMinor: input.amountMinor,
      },
    });
  }
}

export class CreditNoteArchived extends DomainEvent<
  "CreditNoteArchived",
  Readonly<{ creditNoteId: string }>
> {
  static create(input: {
    organizationId: string;
    creditNoteId: CreditNoteId;
    occurredAt?: Date;
  }): CreditNoteArchived {
    return new CreditNoteArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "CreditNoteArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.creditNoteId,
      organizationId: input.organizationId,
      payload: { creditNoteId: input.creditNoteId },
    });
  }
}
