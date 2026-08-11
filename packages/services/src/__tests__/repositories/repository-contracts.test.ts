import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { PriceBook } from "../../aggregates/PriceBook/PriceBook.js";
import { PriceRule } from "../../aggregates/PriceRule/PriceRule.js";
import { Service } from "../../aggregates/Service/Service.js";
import { ServiceCategory } from "../../aggregates/ServiceCategory/ServiceCategory.js";
import { ServiceStatus } from "../../enums/ServiceStatus.js";
import {
  InMemoryCategoryRepository,
  InMemoryPriceBookRepository,
  InMemoryPriceRuleRepository,
  InMemoryServiceRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("Repository contracts", () => {
  it("Category and Service ports", async () => {
    const catRepo = new InMemoryCategoryRepository();
    const cat = ServiceCategory.create({
      organizationId: orgId,
      name: "Repo Cat",
    });
    await catRepo.save(cat);
    expect(await catRepo.exists(cat.id)).toBe(true);
    expect((await catRepo.findByName(orgId, "Repo Cat"))?.id).toBe(cat.id);

    const svcRepo = new InMemoryServiceRepository();
    const svc = Service.create({
      organizationId: orgId,
      serviceCode: "REPO-SVC",
      name: "Repo",
      categoryId: cat.id,
    });
    await svcRepo.save(svc);
    expect(
      (await svcRepo.findByServiceCode(orgId, "repo-svc"))?.id,
    ).toBe(svc.id);
    expect((await svcRepo.findByCategory(cat.id)).length).toBe(1);
    expect((await svcRepo.findByStatus(ServiceStatus.DRAFT)).length).toBe(1);
    svc.activate();
    await svcRepo.update(svc);
    await svcRepo.archive(svc.id);
  });

  it("PriceBook and PriceRule ports", async () => {
    const bookRepo = new InMemoryPriceBookRepository();
    const book = PriceBook.create({
      organizationId: orgId,
      name: "Repo Book",
      currency: "USD",
    });
    await bookRepo.save(book);
    book.publish();
    await bookRepo.update(book);
    expect((await bookRepo.findPublished(orgId)).length).toBe(1);
    expect((await bookRepo.findByCurrency(orgId, "usd")).length).toBe(1);

    const cat = ServiceCategory.create({
      organizationId: orgId,
      name: "C",
    });
    const svc = Service.create({
      organizationId: orgId,
      serviceCode: "R",
      name: "R",
      categoryId: cat.id,
    });
    const ruleRepo = new InMemoryPriceRuleRepository();
    const rule = PriceRule.create({
      organizationId: orgId,
      priceBookId: book.id,
      serviceId: svc.id,
      basePriceMinor: 99,
      currency: "USD",
    });
    await ruleRepo.save(rule);
    expect(
      (await ruleRepo.findActiveByServiceAndBook(svc.id, book.id))?.id,
    ).toBe(rule.id);
    expect((await ruleRepo.findByPriceBook(book.id)).length).toBe(1);
    await ruleRepo.archive(rule.id);
  });
});
