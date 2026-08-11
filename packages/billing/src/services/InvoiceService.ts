import type { DeliveryId } from "@creative-lab/delivery";
import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import {
  Invoice,
  type CreateInvoiceProps,
} from "../aggregates/Invoice/Invoice.js";
import { InvoiceStatus } from "../enums/InvoiceStatus.js";
import { InvoiceNotFoundError } from "../errors/BillingErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { InvoiceLifecyclePolicy } from "../policies/InvoiceLifecyclePolicy.js";
import type { InvoiceLineRepository } from "../repositories/InvoiceLineRepository.js";
import type { InvoiceRepository } from "../repositories/InvoiceRepository.js";
import type { InvoiceId } from "../types/ids.js";

export type InvoiceServiceDeps = {
  invoiceRepository: InvoiceRepository;
  invoiceLineRepository: InvoiceLineRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class InvoiceService {
  constructor(private readonly deps: InvoiceServiceDeps) {}

  async create(props: CreateInvoiceProps): Promise<Invoice> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const invoice = Invoice.create(props);
    await this.deps.invoiceRepository.save(invoice);
    await this.deps.eventPublisher.publish(invoice.pullDomainEvents());
    return invoice;
  }

  async issue(id: InvoiceId, now?: Date): Promise<Invoice> {
    const invoice = await this.getById(id);
    const lines = await this.deps.invoiceLineRepository.findByInvoice(id);
    invoice.recalculateFromLines(lines, now);
    invoice.issue(now);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish(invoice.pullDomainEvents());
    return invoice;
  }

  async void(id: InvoiceId, now?: Date): Promise<Invoice> {
    const invoice = await this.getById(id);
    InvoiceLifecyclePolicy.assertCanVoid(invoice);
    invoice.void(now);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish(invoice.pullDomainEvents());
    return invoice;
  }

  async archive(id: InvoiceId, now?: Date): Promise<Invoice> {
    const invoice = await this.getById(id);
    InvoiceLifecyclePolicy.assertCanTransition(
      invoice,
      InvoiceStatus.ARCHIVED,
    );
    invoice.archive(now);
    await this.deps.invoiceRepository.archive(id);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish(invoice.pullDomainEvents());
    return invoice;
  }

  async recalculate(id: InvoiceId, now?: Date): Promise<Invoice> {
    const invoice = await this.getById(id);
    InvoiceLifecyclePolicy.assertDraft(invoice);
    const lines = await this.deps.invoiceLineRepository.findByInvoice(id);
    invoice.recalculateFromLines(lines, now);
    await this.deps.invoiceRepository.update(invoice);
    await this.deps.eventPublisher.publish(invoice.pullDomainEvents());
    return invoice;
  }

  async getById(id: InvoiceId): Promise<Invoice> {
    const invoice = await this.deps.invoiceRepository.findById(id);
    if (!invoice) throw new InvoiceNotFoundError(id);
    return invoice;
  }

  async findByInvoiceNumber(
    invoiceNumber: string,
  ): Promise<Invoice | null> {
    return this.deps.invoiceRepository.findByInvoiceNumber(invoiceNumber);
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Invoice[]> {
    return this.deps.invoiceRepository.findByOrganization(organizationId);
  }

  async listByProject(projectId: ProjectId): Promise<Invoice[]> {
    return this.deps.invoiceRepository.findByProject(projectId);
  }

  async listByDelivery(deliveryId: DeliveryId): Promise<Invoice[]> {
    return this.deps.invoiceRepository.findByDelivery(deliveryId);
  }

  async listOutstanding(): Promise<Invoice[]> {
    return this.deps.invoiceRepository.findOutstanding();
  }
}
