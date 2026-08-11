import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { CustomerStatus } from "../../enums/CustomerStatus.js";
import { InteractionType } from "../../enums/InteractionType.js";
import { OpportunityStatus } from "../../enums/OpportunityStatus.js";
import {
  ContactAdded,
  CustomerActivated,
  CustomerArchived,
  CustomerCreated,
  InteractionRecorded,
  OpportunityArchived,
  OpportunityCreated,
  OpportunityLost,
  OpportunityWon,
  PrimaryContactChanged,
} from "../../events/crm-events.js";
import {
  asContactId,
  asCustomerId,
  asInteractionId,
  asOpportunityId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const customerId = asCustomerId("cust-1");

describe("Domain events", () => {
  it("CustomerCreated frozen and versioned", () => {
    const e = CustomerCreated.create({
      organizationId: orgId,
      customerId,
      customerNumber: "C-1",
      name: "Acme",
      status: CustomerStatus.LEAD,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
    expect(e.payload.customerNumber).toBe("C-1");
  });

  it("covers CRM event set", () => {
    const events = [
      CustomerActivated.create({ organizationId: orgId, customerId }),
      CustomerArchived.create({ organizationId: orgId, customerId }),
      ContactAdded.create({
        organizationId: orgId,
        contactId: asContactId("ct-1"),
        customerId,
        email: "a@b.com",
        isPrimary: true,
      }),
      PrimaryContactChanged.create({
        organizationId: orgId,
        customerId,
        contactId: asContactId("ct-1"),
        previousContactId: null,
      }),
      OpportunityCreated.create({
        organizationId: orgId,
        opportunityId: asOpportunityId("op-1"),
        customerId,
        title: "Deal",
        status: OpportunityStatus.OPEN,
      }),
      OpportunityWon.create({
        organizationId: orgId,
        opportunityId: asOpportunityId("op-1"),
        customerId,
      }),
      OpportunityLost.create({
        organizationId: orgId,
        opportunityId: asOpportunityId("op-1"),
        customerId,
      }),
      OpportunityArchived.create({
        organizationId: orgId,
        opportunityId: asOpportunityId("op-1"),
      }),
      InteractionRecorded.create({
        organizationId: orgId,
        interactionId: asInteractionId("in-1"),
        customerId,
        contactId: null,
        type: InteractionType.NOTE,
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.payload)).toBe(true);
    }
  });
});
