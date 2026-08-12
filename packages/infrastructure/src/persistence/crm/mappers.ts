import {
  Customer,
  Contact,
  Opportunity,
  Interaction,
  asCustomerId,
  asContactId,
  asOpportunityId,
  asInteractionId,
  type CustomerSnapshot,
  type ContactSnapshot,
  type OpportunitySnapshot,
  type InteractionSnapshot,
} from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import type { InferSelectModel } from "drizzle-orm";
import type { customers, contacts, opportunities, interactions } from "./schema.js";

type CustomerRow = InferSelectModel<typeof customers>;
type ContactRow = InferSelectModel<typeof contacts>;
type OpportunityRow = InferSelectModel<typeof opportunities>;
type InteractionRow = InferSelectModel<typeof interactions>;

export type { CustomerRow, ContactRow, OpportunityRow, InteractionRow };

export class CustomerMapper {
  static toRow(entity: Customer): CustomerRow {
    const s = entity.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      customerNumber: s.customerNumber,
      name: s.name,
      legalName: s.legalName ?? null,
      status: s.status,
      industry: s.industry ?? null,
      billingAddress: s.billingAddress ?? null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archivedAt: s.archivedAt ?? null,
    };
  }

  static fromRow(row: CustomerRow): Customer {
    const s: CustomerSnapshot = {
      id: asCustomerId(row.id),
      organizationId: asOrganizationId(row.organizationId),
      customerNumber: row.customerNumber,
      name: row.name,
      legalName: row.legalName ?? null,
      status: row.status as CustomerSnapshot["status"],
      industry: row.industry ?? null,
      billingAddress: row.billingAddress ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt ?? null,
    };
    return Customer.reconstitute(s);
  }
}

export class ContactMapper {
  static toRow(entity: Contact): ContactRow {
    const s = entity.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      customerId: s.customerId,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone ?? null,
      role: s.role ?? null,
      isPrimary: s.isPrimary,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archivedAt: s.archivedAt ?? null,
    };
  }

  static fromRow(row: ContactRow): Contact {
    const s: ContactSnapshot = {
      id: asContactId(row.id),
      organizationId: asOrganizationId(row.organizationId),
      customerId: asCustomerId(row.customerId),
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone ?? null,
      role: row.role ?? null,
      isPrimary: row.isPrimary,
      status: row.status as ContactSnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt ?? null,
    };
    return Contact.reconstitute(s);
  }
}

export class OpportunityMapper {
  static toRow(entity: Opportunity): OpportunityRow {
    const s = entity.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      customerId: s.customerId,
      title: s.title,
      estimatedValueMinor: s.estimatedValueMinor,
      probability: s.probability,
      expectedCloseDate: s.expectedCloseDate ?? null,
      projectId: s.projectId ?? null,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archivedAt: s.archivedAt ?? null,
    };
  }

  static fromRow(row: OpportunityRow): Opportunity {
    const s: OpportunitySnapshot = {
      id: asOpportunityId(row.id),
      organizationId: asOrganizationId(row.organizationId),
      customerId: asCustomerId(row.customerId),
      title: row.title,
      estimatedValueMinor: row.estimatedValueMinor,
      probability: row.probability,
      expectedCloseDate: row.expectedCloseDate ?? null,
      projectId: row.projectId ?? null,
      status: row.status as OpportunitySnapshot["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archivedAt: row.archivedAt ?? null,
    };
    return Opportunity.reconstitute(s);
  }
}

export class InteractionMapper {
  static toRow(entity: Interaction): InteractionRow {
    const s = entity.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      customerId: s.customerId,
      contactId: s.contactId ?? null,
      type: s.type,
      summary: s.summary,
      occurredAt: s.occurredAt,
      createdAt: s.createdAt,
    };
  }

  static fromRow(row: InteractionRow): Interaction {
    const s: InteractionSnapshot = {
      id: asInteractionId(row.id),
      organizationId: asOrganizationId(row.organizationId),
      customerId: asCustomerId(row.customerId),
      contactId: row.contactId ? asContactId(row.contactId) : null,
      type: row.type as InteractionSnapshot["type"],
      summary: row.summary,
      occurredAt: row.occurredAt,
      createdAt: row.createdAt,
    };
    return Interaction.reconstitute(s);
  }
}
