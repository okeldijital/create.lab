import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Contact } from "../../aggregates/Contact/Contact.js";
import { Customer } from "../../aggregates/Customer/Customer.js";
import { Interaction } from "../../aggregates/Interaction/Interaction.js";
import { Opportunity } from "../../aggregates/Opportunity/Opportunity.js";
import { ContactStatus } from "../../enums/ContactStatus.js";
import { CustomerStatus } from "../../enums/CustomerStatus.js";
import { InteractionType } from "../../enums/InteractionType.js";
import { OpportunityStatus } from "../../enums/OpportunityStatus.js";
import {
  CRMValidationError,
  InvalidCustomerStateError,
  InvalidOpportunityStateError,
} from "../../errors/CRMErrors.js";
import {
  ContactAdded,
  CustomerActivated,
  CustomerCreated,
  InteractionRecorded,
  OpportunityCreated,
  OpportunityLost,
  OpportunityWon,
} from "../../events/crm-events.js";

const orgId = asOrganizationId("org-1");

function createCustomer(
  overrides: Partial<Parameters<typeof Customer.create>[0]> = {},
) {
  return Customer.create({
    organizationId: orgId,
    name: "Acme Studios",
    customerNumber: "CUST-001",
    ...overrides,
  });
}

describe("Customer aggregate", () => {
  it("creates LEAD with event", () => {
    const c = createCustomer();
    expect(c.status).toBe(CustomerStatus.LEAD);
    expect(c.customerNumber.value).toBe("CUST-001");
    expect(c.pullDomainEvents()[0]).toBeInstanceOf(CustomerCreated);
  });

  it("lifecycle LEAD → PROSPECT → ACTIVE → INACTIVE → restore", () => {
    const c = createCustomer();
    c.pullDomainEvents();
    c.promoteToProspect();
    expect(c.status).toBe(CustomerStatus.PROSPECT);
    c.activate();
    expect(c.isActive).toBe(true);
    expect(c.pullDomainEvents().some((e) => e instanceof CustomerActivated)).toBe(
      true,
    );
    c.deactivate();
    expect(c.status).toBe(CustomerStatus.INACTIVE);
    c.restore();
    expect(c.isActive).toBe(true);
  });

  it("archives and becomes immutable", () => {
    const c = createCustomer();
    c.archive();
    expect(c.isArchived).toBe(true);
    expect(() => c.promoteToProspect()).toThrow(InvalidCustomerStateError);
  });

  it("legal name immutable once ACTIVE", () => {
    const c = createCustomer({ legalName: "Acme LLC" });
    c.promoteToProspect();
    c.activate();
    expect(() => c.setLegalName("Other")).toThrow(InvalidCustomerStateError);
  });

  it("can set legal name before active", () => {
    const c = createCustomer();
    c.setLegalName("Acme Legal");
    expect(c.legalName.value).toBe("Acme Legal");
  });

  it("reconstitutes snapshot", () => {
    const c = createCustomer({ name: "Snap Co" });
    const r = Customer.reconstitute(c.toSnapshot());
    expect(r.name.value).toBe("Snap Co");
  });

  it("requires organization", () => {
    expect(() =>
      Customer.create({
        organizationId: "" as never,
        name: "X",
      }),
    ).toThrow(InvalidCustomerStateError);
  });

  it("cannot restore from LEAD", () => {
    const c = createCustomer();
    expect(() => c.restore()).toThrow(InvalidCustomerStateError);
  });

  it("rename and industry while mutable", () => {
    const c = createCustomer();
    c.rename("New Name");
    c.setIndustry("Media");
    c.setBillingAddress("1 Main St");
    expect(c.name.value).toBe("New Name");
    expect(c.industry.value).toBe("Media");
    expect(c.billingAddress.value).toBe("1 Main St");
  });

  it("generates customer number when omitted", () => {
    const c = Customer.create({
      organizationId: orgId,
      name: "Gen Co",
    });
    expect(c.customerNumber.value.startsWith("CUST-")).toBe(true);
  });
});

describe("Contact aggregate", () => {
  it("creates ACTIVE with event", () => {
    const cust = createCustomer();
    const contact = Contact.create({
      organizationId: orgId,
      customerId: cust.id,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@acme.com",
      isPrimary: true,
    });
    expect(contact.status).toBe(ContactStatus.ACTIVE);
    expect(contact.isPrimary).toBe(true);
    expect(contact.email.value).toBe("ada@acme.com");
    expect(contact.pullDomainEvents()[0]).toBeInstanceOf(ContactAdded);
  });

  it("archives and clears primary", () => {
    const cust = createCustomer();
    const contact = Contact.create({
      organizationId: orgId,
      customerId: cust.id,
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      isPrimary: true,
    });
    contact.archive();
    expect(contact.isArchived).toBe(true);
    expect(contact.isPrimary).toBe(false);
    expect(() => contact.markPrimary()).toThrow(InvalidCustomerStateError);
  });

  it("reconstitutes", () => {
    const cust = createCustomer();
    const contact = Contact.create({
      organizationId: orgId,
      customerId: cust.id,
      firstName: "X",
      lastName: "Y",
      email: "x@y.com",
    });
    const r = Contact.reconstitute(contact.toSnapshot());
    expect(r.email.value).toBe("x@y.com");
  });
});

describe("Opportunity aggregate", () => {
  it("creates OPEN and progresses to WON", () => {
    const cust = createCustomer();
    const o = Opportunity.create({
      organizationId: orgId,
      customerId: cust.id,
      title: "Brand film",
      estimatedValueMinor: 500000,
      probability: 20,
    });
    expect(o.status).toBe(OpportunityStatus.OPEN);
    expect(o.pullDomainEvents()[0]).toBeInstanceOf(OpportunityCreated);
    o.pullDomainEvents();
    o.qualify();
    o.propose();
    o.negotiate();
    o.win();
    expect(o.isWon).toBe(true);
    expect(o.probability.value).toBe(100);
    expect(o.pullDomainEvents().some((e) => e instanceof OpportunityWon)).toBe(
      true,
    );
  });

  it("can lose from OPEN", () => {
    const cust = createCustomer();
    const o = Opportunity.create({
      organizationId: orgId,
      customerId: cust.id,
      title: "Lost deal",
    });
    o.pullDomainEvents();
    o.lose();
    expect(o.isLost).toBe(true);
    expect(o.pullDomainEvents()[0]).toBeInstanceOf(OpportunityLost);
  });

  it("rejects illegal transitions and archive immutability", () => {
    const cust = createCustomer();
    const o = Opportunity.create({
      organizationId: orgId,
      customerId: cust.id,
      title: "X",
    });
    expect(() => o.win()).toThrow(InvalidOpportunityStateError);
    o.archive();
    expect(() => o.qualify()).toThrow(InvalidOpportunityStateError);
  });

  it("validates estimate updates", () => {
    const cust = createCustomer();
    const o = Opportunity.create({
      organizationId: orgId,
      customerId: cust.id,
      title: "Y",
    });
    o.updateEstimate(1000, 40);
    expect(o.estimatedValue.minorUnits).toBe(1000);
    expect(o.probability.value).toBe(40);
  });
});

describe("Interaction aggregate", () => {
  it("records immutable interaction", () => {
    const cust = createCustomer();
    const i = Interaction.create({
      organizationId: orgId,
      customerId: cust.id,
      type: InteractionType.MEETING,
      summary: "Kickoff call",
    });
    expect(i.type).toBe(InteractionType.MEETING);
    expect(i.summary.value).toBe("Kickoff call");
    expect(i.pullDomainEvents()[0]).toBeInstanceOf(InteractionRecorded);
    const snap = i.toSnapshot();
    const r = Interaction.reconstitute(snap);
    expect(r.summary.value).toBe("Kickoff call");
  });

  it("rejects invalid type and empty summary", () => {
    const cust = createCustomer();
    expect(() =>
      Interaction.create({
        organizationId: orgId,
        customerId: cust.id,
        type: "SMS" as never,
        summary: "x",
      }),
    ).toThrow(CRMValidationError);
    expect(() =>
      Interaction.create({
        organizationId: orgId,
        customerId: cust.id,
        type: InteractionType.NOTE,
        summary: "",
      }),
    ).toThrow(CRMValidationError);
  });
});
