import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Contact } from "../../aggregates/Contact/Contact.js";
import { Customer } from "../../aggregates/Customer/Customer.js";
import { Interaction } from "../../aggregates/Interaction/Interaction.js";
import { Opportunity } from "../../aggregates/Opportunity/Opportunity.js";
import { CustomerStatus } from "../../enums/CustomerStatus.js";
import { InteractionType } from "../../enums/InteractionType.js";
import { OpportunityStatus } from "../../enums/OpportunityStatus.js";
import {
  InMemoryContactRepository,
  InMemoryCustomerRepository,
  InMemoryInteractionRepository,
  InMemoryOpportunityRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("Repository contracts", () => {
  it("CustomerRepository ports", async () => {
    const repo = new InMemoryCustomerRepository();
    const c = Customer.create({
      organizationId: orgId,
      name: "Repo Co",
      customerNumber: "CUST-REPO-1",
    });
    await repo.save(c);
    expect(await repo.exists(c.id)).toBe(true);
    expect((await repo.findByOrganization(orgId))[0]?.id).toBe(c.id);
    expect(
      (await repo.findByCustomerNumber(orgId, "CUST-REPO-1"))?.id,
    ).toBe(c.id);
    expect((await repo.findByStatus(CustomerStatus.LEAD)).length).toBe(1);
    c.promoteToProspect();
    await repo.update(c);
    await repo.archive(c.id);
  });

  it("ContactRepository ports", async () => {
    const cust = Customer.create({
      organizationId: orgId,
      name: "C",
    });
    const repo = new InMemoryContactRepository();
    const contact = Contact.create({
      organizationId: orgId,
      customerId: cust.id,
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      isPrimary: true,
    });
    await repo.save(contact);
    expect((await repo.findByCustomer(cust.id)).length).toBe(1);
    expect((await repo.findPrimaryContact(cust.id))?.id).toBe(contact.id);
    await repo.archive(contact.id);
  });

  it("OpportunityRepository and InteractionRepository ports", async () => {
    const cust = Customer.create({ organizationId: orgId, name: "C" });
    const oRepo = new InMemoryOpportunityRepository();
    const o = Opportunity.create({
      organizationId: orgId,
      customerId: cust.id,
      title: "Deal",
    });
    await oRepo.save(o);
    expect((await oRepo.findByCustomer(cust.id)).length).toBe(1);
    expect(
      (await oRepo.findByStatus(OpportunityStatus.OPEN)).length,
    ).toBe(1);
    o.qualify();
    await oRepo.update(o);
    await oRepo.archive(o.id);

    const iRepo = new InMemoryInteractionRepository();
    const i = Interaction.create({
      organizationId: orgId,
      customerId: cust.id,
      type: InteractionType.EMAIL,
      summary: "Hello",
    });
    await iRepo.save(i);
    expect(await iRepo.exists(i.id)).toBe(true);
    expect((await iRepo.findByCustomer(cust.id)).length).toBe(1);
  });
});
