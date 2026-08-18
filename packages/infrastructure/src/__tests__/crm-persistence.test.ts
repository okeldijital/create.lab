import { describe, expect, it } from "vitest";
import { Customer, Contact, Opportunity, Interaction, InteractionType } from "@creative-lab/crm";
import { asCustomerId, asContactId } from "@creative-lab/crm";
import { asOrganizationId } from "@creative-lab/organization";
import { CustomerMapper, ContactMapper, OpportunityMapper, InteractionMapper, customers, contacts, opportunities, interactions } from "../persistence/crm/index.js";

describe("CRM persistence mappings", () => {
  const now = new Date("2026-08-12T10:00:00.000Z");
  const organizationId = asOrganizationId("11111111-1111-4111-8111-111111111111");
  const customer = Customer.create({ organizationId, id: "22222222-2222-4222-8222-222222222222", name: "Acme", customerNumber: "CUS-001", legalName: "Acme Ltd", industry: "Creative", billingAddress: "Durban", now });

  it("round-trips customers", () => {
    const restored = CustomerMapper.fromRow(CustomerMapper.toRow(customer));
    expect(restored.toSnapshot()).toEqual(customer.toSnapshot());
  });

  it("round-trips contacts", () => {
    const contact = Contact.create({ organizationId, customerId: asCustomerId(customer.id), id: "33333333-3333-4333-8333-333333333333", firstName: "A", lastName: "User", email: "a@example.com", phone: "+27123", role: "Director", isPrimary: true, now });
    const restored = ContactMapper.fromRow(ContactMapper.toRow(contact));
    expect(restored.toSnapshot()).toEqual(contact.toSnapshot());
  });

  it("round-trips opportunities", () => {
    const opportunity = Opportunity.create({ organizationId, customerId: asCustomerId(customer.id), id: "44444444-4444-4444-8444-444444444444", title: "Website", estimatedValueMinor: 125000, probability: 60, expectedCloseDate: new Date("2026-09-01T00:00:00.000Z"), now });
    const restored = OpportunityMapper.fromRow(OpportunityMapper.toRow(opportunity));
    expect(restored.toSnapshot()).toEqual(opportunity.toSnapshot());
  });

  it("round-trips immutable interactions", () => {
    const interaction = Interaction.create({ organizationId, customerId: asCustomerId(customer.id), contactId: asContactId("33333333-3333-4333-8333-333333333333"), id: "55555555-5555-4555-8555-555555555555", type: InteractionType.MEETING, summary: "Discovery meeting", occurredAt: new Date("2026-08-11T12:00:00.000Z"), now });
    const restored = InteractionMapper.fromRow(InteractionMapper.toRow(interaction));
    expect(restored.toSnapshot()).toEqual(interaction.toSnapshot());
  });

  it("exposes all CRM tables", () => {
    expect(customers).toBeDefined();
    expect(contacts).toBeDefined();
    expect(opportunities).toBeDefined();
    expect(interactions).toBeDefined();
  });
});
