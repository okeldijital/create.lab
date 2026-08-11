import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Contact } from "../../aggregates/Contact/Contact.js";
import { Customer } from "../../aggregates/Customer/Customer.js";
import { Opportunity } from "../../aggregates/Opportunity/Opportunity.js";
import { CustomerStatus } from "../../enums/CustomerStatus.js";
import { OpportunityStatus } from "../../enums/OpportunityStatus.js";
import {
  CRMValidationError,
  DuplicateContactEmailError,
  DuplicatePrimaryContactError,
  InvalidCustomerStateError,
  InvalidOpportunityStateError,
} from "../../errors/CRMErrors.js";
import { ContactPolicy } from "../../policies/ContactPolicy.js";
import { CustomerLifecyclePolicy } from "../../policies/CustomerLifecyclePolicy.js";
import { InteractionPolicy } from "../../policies/InteractionPolicy.js";
import { OpportunityPolicy } from "../../policies/OpportunityPolicy.js";

const orgId = asOrganizationId("org-1");

describe("CustomerLifecyclePolicy", () => {
  it("allows legal transitions and blocks archived", () => {
    const c = Customer.create({
      organizationId: orgId,
      name: "A",
    });
    CustomerLifecyclePolicy.assertCanTransition(c, CustomerStatus.PROSPECT);
    c.archive();
    expect(() =>
      CustomerLifecyclePolicy.assertMutable(c),
    ).toThrow(InvalidCustomerStateError);
  });

  it("restore only inactive", () => {
    const c = Customer.create({ organizationId: orgId, name: "A" });
    expect(() => CustomerLifecyclePolicy.assertCanRestore(c)).toThrow(
      InvalidCustomerStateError,
    );
  });
});

describe("ContactPolicy", () => {
  it("enforces one primary", () => {
    const cust = Customer.create({ organizationId: orgId, name: "A" });
    const primary = Contact.create({
      organizationId: orgId,
      customerId: cust.id,
      firstName: "P",
      lastName: "R",
      email: "p@a.com",
      isPrimary: true,
    });
    expect(() =>
      ContactPolicy.assertSinglePrimary(cust.id, [primary], true),
    ).toThrow(DuplicatePrimaryContactError);
  });

  it("enforces unique email", () => {
    const cust = Customer.create({ organizationId: orgId, name: "A" });
    const existing = Contact.create({
      organizationId: orgId,
      customerId: cust.id,
      firstName: "A",
      lastName: "B",
      email: "dup@a.com",
    });
    expect(() =>
      ContactPolicy.assertUniqueEmail(cust.id, "DUP@a.com", [existing]),
    ).toThrow(DuplicateContactEmailError);
  });
});

describe("OpportunityPolicy", () => {
  it("validates probability and value", () => {
    expect(OpportunityPolicy.assertValidProbability(0).value).toBe(0);
    expect(OpportunityPolicy.assertValidValue(10).minorUnits).toBe(10);
    expect(() => OpportunityPolicy.assertValidProbability(200)).toThrow();
  });

  it("enforces win/lose transitions", () => {
    const cust = Customer.create({ organizationId: orgId, name: "A" });
    const o = Opportunity.create({
      organizationId: orgId,
      customerId: cust.id,
      title: "T",
    });
    expect(() => OpportunityPolicy.assertCanWin(o)).toThrow(
      InvalidOpportunityStateError,
    );
    OpportunityPolicy.assertCanLose(o);
    o.lose();
    OpportunityPolicy.assertCanTransition(o, OpportunityStatus.ARCHIVED);
  });
});

describe("InteractionPolicy", () => {
  it("blocks archived customer", () => {
    const c = Customer.create({ organizationId: orgId, name: "A" });
    c.archive();
    expect(() => InteractionPolicy.assertCustomerActive(c)).toThrow(
      CRMValidationError,
    );
  });

  it("validates contact ownership", () => {
    const c1 = Customer.create({ organizationId: orgId, name: "A" });
    const c2 = Customer.create({ organizationId: orgId, name: "B" });
    const contact = Contact.create({
      organizationId: orgId,
      customerId: c2.id,
      firstName: "X",
      lastName: "Y",
      email: "x@y.com",
    });
    expect(() =>
      InteractionPolicy.assertContactBelongsToCustomer(
        contact,
        c1,
        contact.id,
      ),
    ).toThrow(CRMValidationError);
  });
});
