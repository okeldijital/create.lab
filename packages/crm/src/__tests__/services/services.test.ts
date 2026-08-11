import { describe, expect, it, beforeEach } from "vitest";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { CustomerStatus } from "../../enums/CustomerStatus.js";
import { InteractionType } from "../../enums/InteractionType.js";
import { OpportunityStatus } from "../../enums/OpportunityStatus.js";
import {
  ContactNotFoundError,
  CustomerNotFoundError,
  DuplicateCustomerNumberError,
  DuplicatePrimaryContactError,
  OpportunityNotFoundError,
} from "../../errors/CRMErrors.js";
import {
  ContactAdded,
  CustomerActivated,
  CustomerCreated,
  InteractionRecorded,
  OpportunityCreated,
  OpportunityWon,
  PrimaryContactChanged,
} from "../../events/crm-events.js";
import { ContactService } from "../../services/ContactService.js";
import { CustomerService } from "../../services/CustomerService.js";
import { InteractionService } from "../../services/InteractionService.js";
import { OpportunityService } from "../../services/OpportunityService.js";
import {
  InMemoryContactRepository,
  InMemoryCustomerRepository,
  InMemoryEventPublisher,
  InMemoryInteractionRepository,
  InMemoryOpportunityRepository,
  InMemoryOrganizationRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("CRM services", () => {
  let orgs: InMemoryOrganizationRepository;
  let customers: InMemoryCustomerRepository;
  let contacts: InMemoryContactRepository;
  let opportunities: InMemoryOpportunityRepository;
  let interactions: InMemoryInteractionRepository;
  let events: InMemoryEventPublisher;
  let customerService: CustomerService;
  let contactService: ContactService;
  let opportunityService: OpportunityService;
  let interactionService: InteractionService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    customers = new InMemoryCustomerRepository();
    contacts = new InMemoryContactRepository();
    opportunities = new InMemoryOpportunityRepository();
    interactions = new InMemoryInteractionRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    customerService = new CustomerService({
      customerRepository: customers,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    contactService = new ContactService({
      contactRepository: contacts,
      customerRepository: customers,
      eventPublisher: events,
    });
    opportunityService = new OpportunityService({
      opportunityRepository: opportunities,
      customerRepository: customers,
      eventPublisher: events,
    });
    interactionService = new InteractionService({
      interactionRepository: interactions,
      customerRepository: customers,
      contactRepository: contacts,
      eventPublisher: events,
    });
  });

  async function createLead(number = "CUST-SVC-1") {
    return customerService.create({
      organizationId: orgId,
      name: "Client Co",
      customerNumber: number,
    });
  }

  it("creates customer as LEAD", async () => {
    const c = await createLead();
    expect(c.status).toBe(CustomerStatus.LEAD);
    expect(events.events.some((e) => e instanceof CustomerCreated)).toBe(true);
  });

  it("rejects duplicate customer number", async () => {
    await createLead("DUP-1");
    await expect(createLead("DUP-1")).rejects.toThrow(
      DuplicateCustomerNumberError,
    );
  });

  it("promotes lead → prospect → active", async () => {
    const c = await createLead();
    await customerService.promoteToProspect(c.id);
    const active = await customerService.activate(c.id);
    expect(active.status).toBe(CustomerStatus.ACTIVE);
    expect(events.events.some((e) => e instanceof CustomerActivated)).toBe(
      true,
    );
  });

  it("deactivate restore archive", async () => {
    const c = await createLead();
    await customerService.promoteToProspect(c.id);
    await customerService.activate(c.id);
    await customerService.deactivate(c.id);
    expect((await customerService.getById(c.id)).status).toBe(
      CustomerStatus.INACTIVE,
    );
    await customerService.restore(c.id);
    expect((await customerService.getById(c.id)).isActive).toBe(true);
    await customerService.archive(c.id);
    expect((await customerService.getById(c.id)).isArchived).toBe(true);
  });

  it("adds contact and enforces primary uniqueness", async () => {
    const c = await createLead();
    const primary = await contactService.add({
      organizationId: orgId,
      customerId: c.id,
      firstName: "Pat",
      lastName: "Primary",
      email: "pat@client.com",
      isPrimary: true,
    });
    expect(events.events.some((e) => e instanceof ContactAdded)).toBe(true);
    await expect(
      contactService.add({
        organizationId: orgId,
        customerId: c.id,
        firstName: "Other",
        lastName: "Person",
        email: "other@client.com",
        isPrimary: true,
      }),
    ).rejects.toThrow(DuplicatePrimaryContactError);

    const secondary = await contactService.add({
      organizationId: orgId,
      customerId: c.id,
      firstName: "Sec",
      lastName: "Ond",
      email: "sec@client.com",
    });
    await contactService.setPrimary(secondary.id);
    expect((await contactService.getById(primary.id)).isPrimary).toBe(false);
    expect((await contactService.getById(secondary.id)).isPrimary).toBe(true);
    expect(events.events.some((e) => e instanceof PrimaryContactChanged)).toBe(
      true,
    );
  });

  it("archives contact", async () => {
    const c = await createLead();
    const contact = await contactService.add({
      organizationId: orgId,
      customerId: c.id,
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
    });
    await contactService.archive(contact.id);
    expect((await contactService.getById(contact.id)).isArchived).toBe(true);
  });

  it("opportunity full win path", async () => {
    const c = await createLead();
    const o = await opportunityService.create({
      organizationId: orgId,
      customerId: c.id,
      title: "Campaign",
      estimatedValueMinor: 250000,
      probability: 10,
    });
    expect(events.events.some((e) => e instanceof OpportunityCreated)).toBe(
      true,
    );
    await opportunityService.qualify(o.id);
    await opportunityService.propose(o.id);
    await opportunityService.negotiate(o.id);
    const won = await opportunityService.win(o.id);
    expect(won.status).toBe(OpportunityStatus.WON);
    expect(events.events.some((e) => e instanceof OpportunityWon)).toBe(true);
  });

  it("opportunity lose and archive", async () => {
    const c = await createLead("CUST-LOSE");
    const o = await opportunityService.create({
      organizationId: orgId,
      customerId: c.id,
      title: "No deal",
    });
    await opportunityService.lose(o.id);
    expect((await opportunityService.getById(o.id)).isLost).toBe(true);
    await opportunityService.archive(o.id);
    expect((await opportunityService.getById(o.id)).isArchived).toBe(true);
  });

  it("records interaction history", async () => {
    const c = await createLead("CUST-INT");
    const contact = await contactService.add({
      organizationId: orgId,
      customerId: c.id,
      firstName: "C",
      lastName: "D",
      email: "c@d.com",
    });
    await interactionService.record({
      organizationId: orgId,
      customerId: c.id,
      contactId: contact.id,
      type: InteractionType.CALL,
      summary: "Intro call",
      occurredAt: new Date("2026-01-01"),
    });
    await interactionService.record({
      organizationId: orgId,
      customerId: c.id,
      type: InteractionType.NOTE,
      summary: "Follow-up note",
      occurredAt: new Date("2026-02-01"),
    });
    expect(events.events.some((e) => e instanceof InteractionRecorded)).toBe(
      true,
    );
    const history = await interactionService.history(c.id);
    expect(history.length).toBe(2);
    expect(history[0]?.summary.value).toBe("Follow-up note");
  });

  it("list and find queries", async () => {
    const c = await createLead("CUST-Q");
    expect((await customerService.listByOrganization(orgId)).length).toBe(1);
    expect(
      (await customerService.findByCustomerNumber(orgId, "CUST-Q"))?.id,
    ).toBe(c.id);
    await contactService.add({
      organizationId: orgId,
      customerId: c.id,
      firstName: "P",
      lastName: "R",
      email: "p@q.com",
      isPrimary: true,
    });
    expect((await contactService.getPrimary(c.id))?.isPrimary).toBe(true);
    await opportunityService.create({
      organizationId: orgId,
      customerId: c.id,
      title: "O",
    });
    expect((await opportunityService.listByCustomer(c.id)).length).toBe(1);
  });

  it("not found errors", async () => {
    await expect(customerService.getById("missing" as never)).rejects.toThrow(
      CustomerNotFoundError,
    );
    await expect(contactService.getById("missing" as never)).rejects.toThrow(
      ContactNotFoundError,
    );
    await expect(
      opportunityService.getById("missing" as never),
    ).rejects.toThrow(OpportunityNotFoundError);
  });

  it("rejects duplicate contact email", async () => {
    const c = await createLead("CUST-EMAIL");
    await contactService.add({
      organizationId: orgId,
      customerId: c.id,
      firstName: "A",
      lastName: "B",
      email: "same@client.com",
    });
    await expect(
      contactService.add({
        organizationId: orgId,
        customerId: c.id,
        firstName: "C",
        lastName: "D",
        email: "SAME@client.com",
      }),
    ).rejects.toThrow();
  });

  it("cannot add contact to archived customer", async () => {
    const c = await createLead("CUST-ARCH");
    await customerService.archive(c.id);
    await expect(
      contactService.add({
        organizationId: orgId,
        customerId: c.id,
        firstName: "A",
        lastName: "B",
        email: "a@arch.com",
      }),
    ).rejects.toThrow();
  });

  it("cannot win opportunity before negotiation", async () => {
    const c = await createLead("CUST-WIN");
    const o = await opportunityService.create({
      organizationId: orgId,
      customerId: c.id,
      title: "Too early",
    });
    await expect(opportunityService.win(o.id)).rejects.toThrow();
  });

  it("interaction getById", async () => {
    const c = await createLead("CUST-GET-INT");
    const i = await interactionService.record({
      organizationId: orgId,
      customerId: c.id,
      type: InteractionType.OTHER,
      summary: "Misc",
    });
    expect((await interactionService.getById(i.id)).summary.value).toBe(
      "Misc",
    );
  });
});
