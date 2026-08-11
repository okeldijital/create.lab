import type { AnyDomainEvent } from "@creative-lab/core";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { DeliveryId } from "@creative-lab/delivery";
import type { ProjectId } from "@creative-lab/projects";
import type { CreditNote } from "../../aggregates/CreditNote/CreditNote.js";
import type { Invoice } from "../../aggregates/Invoice/Invoice.js";
import type { InvoiceLine } from "../../aggregates/InvoiceLine/InvoiceLine.js";
import type { Payment } from "../../aggregates/Payment/Payment.js";
import { InvoiceStatus } from "../../enums/InvoiceStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { CreditNoteRepository } from "../../repositories/CreditNoteRepository.js";
import type { InvoiceLineRepository } from "../../repositories/InvoiceLineRepository.js";
import type { InvoiceRepository } from "../../repositories/InvoiceRepository.js";
import type { PaymentRepository } from "../../repositories/PaymentRepository.js";
import type {
  CreditNoteId,
  InvoiceId,
  InvoiceLineId,
  PaymentId,
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

export class InMemoryInvoiceRepository implements InvoiceRepository {
  private readonly byId = new Map<string, Invoice>();

  async findById(id: InvoiceId): Promise<Invoice | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Invoice[]> {
    return [...this.byId.values()].filter(
      (i) => i.organizationId === organizationId,
    );
  }
  async findByProject(projectId: ProjectId): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.projectId === projectId);
  }
  async findByDelivery(deliveryId: DeliveryId): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.deliveryId === deliveryId);
  }
  async findByCustomer(customerId: string): Promise<Invoice[]> {
    return [...this.byId.values()].filter((i) => i.customerId === customerId);
  }
  async findByInvoiceNumber(
    invoiceNumber: string,
  ): Promise<Invoice | null> {
    return (
      [...this.byId.values()].find(
        (i) => i.invoiceNumber.value === invoiceNumber,
      ) ?? null
    );
  }
  async findOutstanding(): Promise<Invoice[]> {
    return [...this.byId.values()].filter(
      (i) =>
        i.status === InvoiceStatus.ISSUED ||
        i.status === InvoiceStatus.PARTIALLY_PAID,
    );
  }
  async findPaid(): Promise<Invoice[]> {
    return [...this.byId.values()].filter(
      (i) => i.status === InvoiceStatus.PAID,
    );
  }
  async save(invoice: Invoice): Promise<void> {
    this.byId.set(invoice.id, invoice);
  }
  async update(invoice: Invoice): Promise<void> {
    this.byId.set(invoice.id, invoice);
  }
  async archive(id: InvoiceId): Promise<void> {
    void id;
  }
  async exists(id: InvoiceId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryInvoiceLineRepository implements InvoiceLineRepository {
  private readonly byId = new Map<string, InvoiceLine>();

  async findById(id: InvoiceLineId): Promise<InvoiceLine | null> {
    return this.byId.get(id) ?? null;
  }
  async findByInvoice(invoiceId: InvoiceId): Promise<InvoiceLine[]> {
    return [...this.byId.values()].filter((l) => l.invoiceId === invoiceId);
  }
  async save(line: InvoiceLine): Promise<void> {
    this.byId.set(line.id, line);
  }
  async update(line: InvoiceLine): Promise<void> {
    this.byId.set(line.id, line);
  }
  async delete(id: InvoiceLineId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly byId = new Map<string, Payment>();

  async findById(id: PaymentId): Promise<Payment | null> {
    return this.byId.get(id) ?? null;
  }
  async findByInvoice(invoiceId: InvoiceId): Promise<Payment[]> {
    return [...this.byId.values()].filter((p) => p.invoiceId === invoiceId);
  }
  async save(payment: Payment): Promise<void> {
    this.byId.set(payment.id, payment);
  }
  async update(payment: Payment): Promise<void> {
    this.byId.set(payment.id, payment);
  }
}

export class InMemoryCreditNoteRepository implements CreditNoteRepository {
  private readonly byId = new Map<string, CreditNote>();

  async findById(id: CreditNoteId): Promise<CreditNote | null> {
    return this.byId.get(id) ?? null;
  }
  async findByInvoice(invoiceId: InvoiceId): Promise<CreditNote[]> {
    return [...this.byId.values()].filter((c) => c.invoiceId === invoiceId);
  }
  async save(creditNote: CreditNote): Promise<void> {
    this.byId.set(creditNote.id, creditNote);
  }
  async update(creditNote: CreditNote): Promise<void> {
    this.byId.set(creditNote.id, creditNote);
  }
}
