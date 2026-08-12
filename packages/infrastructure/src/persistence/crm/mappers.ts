import type { Customer, CustomerSnapshot, Contact, ContactSnapshot, Opportunity, OpportunitySnapshot, Interaction, InteractionSnapshot } from "@creative-lab/crm";
import { asCustomerId, asContactId, asOpportunityId, asInteractionId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { customers, contacts, opportunities, interactions } from "./schema.js";

export type CustomerRow = InferSelectModel<typeof customers>;
export type ContactRow = InferSelectModel<typeof contacts>;
export type OpportunityRow = InferSelectModel<typeof opportunities>;
export type InteractionRow = InferSelectModel<typeof interactions>;

export class CustomerMapper {
  static toRow(entity: Customer): InferInsertModel<typeof customers> {
    const s = entity.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, customerNumber: s.customerNumber, name: s.name, legalName: s.legalName, status: s.status, industry: s.industry, billingAddress: s.billingAddress, createdAt: s.createdAt, updatedAt: s.updatedAt, archivedAt: s.archivedAt };
  }
  static fromRow(row: CustomerRow): Customer {
    const s: CustomerSnapshot = { id: asCustomerId(row.id), organizationId: asOrganizationId(row.organizationId), customerNumber: row.customerNumber, name: row.name, legalName: row.legalName, status: row.status as CustomerSnapshot["status"], industry: row.industry, billingAddress: row.billingAddress, createdAt: row.createdAt, updatedAt: row.updatedAt, archivedAt: row.archivedAt };
    return Customer.reconstitute(s);
  }
}

export class ContactMapper {
  static toRow(entity: Contact): InferInsertModel<typeof contacts> {
    const s = entity.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, customerId: s.customerId, firstName: s.firstName, lastName: s.lastName, email: s.email, phone: s.phone, role: s.role, isPrimary: s.isPrimary, status: s.status, createdAt: s.createdAt, updatedAt: s.updatedAt, archivedAt: s.archivedAt };
  }
  static fromRow(row: ContactRow): Contact {
    const s: ContactSnapshot = { id: asContactId(row.id), organizationId: asOrganizationId(row.organizationId), customerId: row.customerId as ContactSnapshot["customerId"], firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone, role: row.role, isPrimary: row.isPrimary, status: row.status as ContactSnapshot["status"], createdAt: row.createdAt, updatedAt: row.updatedAt, archivedAt: row.archivedAt };
    return Contact.reconstitute(s);
  }
}

export class OpportunityMapper {
  static toRow(entity: Opportunity): InferInsertModel<typeof opportunities> {
    const s = entity.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, customerId: s.customerId, title: s.title, estimatedValueMinor: s.estimatedValueMinor, probability: s.probability, expectedCloseDate: s.expectedCloseDate, projectId: s.projectId, status: s.status, createdAt: s.createdAt, updatedAt: s.updatedAt, archivedAt: s.archivedAt };
  }
  static fromRow(row: OpportunityRow): Opportunity {
    const s: OpportunitySnapshot = { id: asOpportunityId(row.id), organizationId: asOrganizationId(row.organizationId), customerId: row.customerId as OpportunitySnapshot["customerId"], title: row.title, estimatedValueMinor: row.estimatedValueMinor, probability: row.probability, expectedCloseDate: row.expectedCloseDate, projectId: row.projectId, status: row.status as OpportunitySnapshot["status"], createdAt: row.createdAt, updatedAt: row.updatedAt, archivedAt: row.archivedAt };
    return Opportunity.reconstitute(s);
  }
}

export class InteractionMapper {
  static toRow(entity: Interaction): InferInsertModel<typeof interactions> {
    const s = entity.toSnapshot();
    return { id: s.id, organizationId: s.organizationId, customerId: s.customerId, contactId: s.contactId, type: s.type, summary: s.summary, occurredAt: s.occurredAt, createdAt: s.createdAt };
  }
  static fromRow(row: InteractionRow): Interaction {
    const s: InteractionSnapshot = { id: asInteractionId(row.id), organizationId: asOrganizationId(row.organizationId), customerId: row.customerId as InteractionSnapshot["customerId"], contactId: row.contactId, type: row.type as InteractionSnapshot["type"], summary: row.summary, occurredAt: row.occurredAt, createdAt: row.createdAt };
    return Interaction.reconstitute(s);
  }
}
