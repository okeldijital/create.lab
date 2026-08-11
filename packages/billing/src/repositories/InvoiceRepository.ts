import type { DeliveryId } from "@creative-lab/delivery";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import type { Invoice } from "../aggregates/Invoice/Invoice.js";
import type { InvoiceId } from "../types/ids.js";

export interface InvoiceRepository {
  findById(id: InvoiceId): Promise<Invoice | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Invoice[]>;
  findByProject(projectId: ProjectId): Promise<Invoice[]>;
  findByDelivery(deliveryId: DeliveryId): Promise<Invoice[]>;
  findByCustomer(customerId: string): Promise<Invoice[]>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  findOutstanding(): Promise<Invoice[]>;
  findPaid(): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<void>;
  update(invoice: Invoice): Promise<void>;
  archive(id: InvoiceId): Promise<void>;
  exists(id: InvoiceId): Promise<boolean>;
}
