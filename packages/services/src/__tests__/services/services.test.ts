import { describe, expect, it, beforeEach } from "vitest";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { PriceBookStatus } from "../../enums/PriceBookStatus.js";
import { PricingModel } from "../../enums/PricingModel.js";
import { ServiceStatus } from "../../enums/ServiceStatus.js";
import {
  CategoryInUseError,
  DuplicatePriceRuleError,
  DuplicateServiceCodeError,
  PublishedPriceBookExistsError,
  ServiceNotFoundError,
} from "../../errors/ServicesErrors.js";
import {
  CategoryCreated,
  PriceBookPublished,
  PriceRuleCreated,
  ServiceActivated,
  ServiceCreated,
} from "../../events/services-events.js";
import { CategoryService } from "../../services/CategoryService.js";
import { PriceBookService } from "../../services/PriceBookService.js";
import { PriceRuleService } from "../../services/PriceRuleService.js";
import { ServiceService } from "../../services/ServiceService.js";
import {
  InMemoryCategoryRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryPriceBookRepository,
  InMemoryPriceRuleRepository,
  InMemoryServiceRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("Services domain services", () => {
  let orgs: InMemoryOrganizationRepository;
  let services: InMemoryServiceRepository;
  let categories: InMemoryCategoryRepository;
  let books: InMemoryPriceBookRepository;
  let rules: InMemoryPriceRuleRepository;
  let events: InMemoryEventPublisher;
  let serviceService: ServiceService;
  let categoryService: CategoryService;
  let priceBookService: PriceBookService;
  let priceRuleService: PriceRuleService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    services = new InMemoryServiceRepository();
    categories = new InMemoryCategoryRepository();
    books = new InMemoryPriceBookRepository();
    rules = new InMemoryPriceRuleRepository();
    events = new InMemoryEventPublisher();
    await orgs.save(
      Organization.create({ name: "Studio", slug: "studio", id: orgId }),
    );
    serviceService = new ServiceService({
      serviceRepository: services,
      categoryRepository: categories,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    categoryService = new CategoryService({
      categoryRepository: categories,
      serviceRepository: services,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    priceBookService = new PriceBookService({
      priceBookRepository: books,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    priceRuleService = new PriceRuleService({
      priceRuleRepository: rules,
      priceBookRepository: books,
      serviceRepository: services,
      eventPublisher: events,
    });
  });

  async function seedCategory(name = "Production") {
    return categoryService.create({
      organizationId: orgId,
      name,
    });
  }

  it("creates category", async () => {
    const c = await seedCategory();
    expect(events.events.some((e) => e instanceof CategoryCreated)).toBe(true);
    expect(c.name.value).toBe("Production");
  });

  it("creates and activates service", async () => {
    const cat = await seedCategory();
    const s = await serviceService.create({
      organizationId: orgId,
      serviceCode: "film-mix",
      name: "Film Mix",
      categoryId: cat.id,
      pricingModel: PricingModel.HOURLY,
    });
    expect(s.status).toBe(ServiceStatus.DRAFT);
    expect(events.events.some((e) => e instanceof ServiceCreated)).toBe(true);
    const active = await serviceService.activate(s.id);
    expect(active.isActive).toBe(true);
    expect(events.events.some((e) => e instanceof ServiceActivated)).toBe(true);
  });

  it("rejects duplicate service code", async () => {
    const cat = await seedCategory();
    await serviceService.create({
      organizationId: orgId,
      serviceCode: "DUP",
      name: "A",
      categoryId: cat.id,
    });
    await expect(
      serviceService.create({
        organizationId: orgId,
        serviceCode: "dup",
        name: "B",
        categoryId: cat.id,
      }),
    ).rejects.toThrow(DuplicateServiceCodeError);
  });

  it("deactivate and archive service", async () => {
    const cat = await seedCategory("C2");
    const s = await serviceService.create({
      organizationId: orgId,
      serviceCode: "ARCH",
      name: "A",
      categoryId: cat.id,
    });
    await serviceService.activate(s.id);
    await serviceService.deactivate(s.id);
    expect((await serviceService.getById(s.id)).status).toBe(
      ServiceStatus.INACTIVE,
    );
    await serviceService.archive(s.id);
    expect((await serviceService.getById(s.id)).isArchived).toBe(true);
  });

  it("blocks category archive with active service", async () => {
    const cat = await seedCategory("C3");
    const s = await serviceService.create({
      organizationId: orgId,
      serviceCode: "USE",
      name: "U",
      categoryId: cat.id,
    });
    await serviceService.activate(s.id);
    await expect(categoryService.archive(cat.id)).rejects.toThrow(
      CategoryInUseError,
    );
  });

  it("archives category when service draft", async () => {
    const cat = await seedCategory("C4");
    await serviceService.create({
      organizationId: orgId,
      serviceCode: "DRAFTSVC",
      name: "D",
      categoryId: cat.id,
    });
    await categoryService.archive(cat.id);
    expect((await categoryService.getById(cat.id)).isArchived).toBe(true);
  });

  it("renames category", async () => {
    const cat = await seedCategory("OldName");
    const renamed = await categoryService.rename(cat.id, "NewName");
    expect(renamed.name.value).toBe("NewName");
  });

  it("publish and retire price book", async () => {
    const book = await priceBookService.create({
      organizationId: orgId,
      name: "USD Book",
      currency: "USD",
    });
    const pub = await priceBookService.publish(book.id);
    expect(pub.status).toBe(PriceBookStatus.PUBLISHED);
    expect(events.events.some((e) => e instanceof PriceBookPublished)).toBe(
      true,
    );
    await priceBookService.retire(book.id);
    expect((await priceBookService.getById(book.id)).status).toBe(
      PriceBookStatus.RETIRED,
    );
  });

  it("one published price book per currency", async () => {
    const a = await priceBookService.create({
      organizationId: orgId,
      name: "A",
      currency: "USD",
    });
    await priceBookService.publish(a.id);
    const b = await priceBookService.create({
      organizationId: orgId,
      name: "B",
      currency: "USD",
    });
    await expect(priceBookService.publish(b.id)).rejects.toThrow(
      PublishedPriceBookExistsError,
    );
  });

  it("creates price rule", async () => {
    const cat = await seedCategory("C5");
    const svc = await serviceService.create({
      organizationId: orgId,
      serviceCode: "PR",
      name: "Priced",
      categoryId: cat.id,
    });
    const book = await priceBookService.create({
      organizationId: orgId,
      name: "Book",
      currency: "USD",
    });
    const rule = await priceRuleService.create({
      organizationId: orgId,
      priceBookId: book.id,
      serviceId: svc.id,
      basePriceMinor: 15000,
      minimumPriceMinor: 10000,
      maximumPriceMinor: 25000,
      currency: "USD",
    });
    expect(rule.basePrice.minorUnits).toBe(15000);
    expect(events.events.some((e) => e instanceof PriceRuleCreated)).toBe(true);
  });

  it("rejects duplicate price rule and invalid range", async () => {
    const cat = await seedCategory("C6");
    const svc = await serviceService.create({
      organizationId: orgId,
      serviceCode: "PR2",
      name: "P",
      categoryId: cat.id,
    });
    const book = await priceBookService.create({
      organizationId: orgId,
      name: "Book2",
      currency: "USD",
    });
    await priceRuleService.create({
      organizationId: orgId,
      priceBookId: book.id,
      serviceId: svc.id,
      basePriceMinor: 1000,
      currency: "USD",
    });
    await expect(
      priceRuleService.create({
        organizationId: orgId,
        priceBookId: book.id,
        serviceId: svc.id,
        basePriceMinor: 2000,
        currency: "USD",
      }),
    ).rejects.toThrow(DuplicatePriceRuleError);
    await expect(
      priceRuleService.create({
        organizationId: orgId,
        priceBookId: book.id,
        serviceId: svc.id,
        basePriceMinor: 100,
        minimumPriceMinor: 200,
        currency: "USD",
      }),
    ).rejects.toThrow();
  });

  it("updates and archives price rule", async () => {
    const cat = await seedCategory("C7");
    const svc = await serviceService.create({
      organizationId: orgId,
      serviceCode: "PR3",
      name: "P",
      categoryId: cat.id,
    });
    const book = await priceBookService.create({
      organizationId: orgId,
      name: "Book3",
      currency: "EUR",
    });
    const rule = await priceRuleService.create({
      organizationId: orgId,
      priceBookId: book.id,
      serviceId: svc.id,
      basePriceMinor: 500,
      currency: "EUR",
    });
    await priceRuleService.updatePricing(rule.id, {
      basePriceMinor: 800,
      maximumPriceMinor: 1200,
    });
    expect((await priceRuleService.getById(rule.id)).basePrice.minorUnits).toBe(
      800,
    );
    await priceRuleService.archive(rule.id);
    expect((await priceRuleService.getById(rule.id)).isArchived).toBe(true);
  });

  it("list queries", async () => {
    const cat = await seedCategory("C8");
    await serviceService.create({
      organizationId: orgId,
      serviceCode: "L1",
      name: "L",
      categoryId: cat.id,
    });
    expect((await serviceService.listByOrganization(orgId)).length).toBe(1);
    expect(
      (await serviceService.findByServiceCode(orgId, "l1"))?.serviceCode.value,
    ).toBe("L1");
    const book = await priceBookService.create({
      organizationId: orgId,
      name: "LB",
      currency: "USD",
    });
    await priceBookService.publish(book.id);
    expect((await priceBookService.listPublished(orgId)).length).toBe(1);
  });

  it("not found", async () => {
    await expect(serviceService.getById("missing" as never)).rejects.toThrow(
      ServiceNotFoundError,
    );
  });

  it("archive price book", async () => {
    const book = await priceBookService.create({
      organizationId: orgId,
      name: "Arch",
      currency: "CAD",
    });
    await priceBookService.archive(book.id);
    expect((await priceBookService.getById(book.id)).isArchived).toBe(true);
  });

  it("allows second published book in different currency", async () => {
    const usd = await priceBookService.create({
      organizationId: orgId,
      name: "USD",
      currency: "USD",
    });
    await priceBookService.publish(usd.id);
    const eur = await priceBookService.create({
      organizationId: orgId,
      name: "EUR",
      currency: "EUR",
    });
    await priceBookService.publish(eur.id);
    expect((await priceBookService.listPublished(orgId)).length).toBe(2);
  });

  it("rejects price rule currency mismatch", async () => {
    const cat = await seedCategory("C9");
    const svc = await serviceService.create({
      organizationId: orgId,
      serviceCode: "CUR",
      name: "C",
      categoryId: cat.id,
    });
    const book = await priceBookService.create({
      organizationId: orgId,
      name: "USD only",
      currency: "USD",
    });
    await expect(
      priceRuleService.create({
        organizationId: orgId,
        priceBookId: book.id,
        serviceId: svc.id,
        basePriceMinor: 100,
        currency: "EUR",
      }),
    ).rejects.toThrow();
  });

  it("list price rules by book and service", async () => {
    const cat = await seedCategory("C10");
    const svc = await serviceService.create({
      organizationId: orgId,
      serviceCode: "LST",
      name: "L",
      categoryId: cat.id,
    });
    const book = await priceBookService.create({
      organizationId: orgId,
      name: "List book",
      currency: "USD",
    });
    await priceRuleService.create({
      organizationId: orgId,
      priceBookId: book.id,
      serviceId: svc.id,
      basePriceMinor: 50,
      currency: "USD",
    });
    expect((await priceRuleService.listByPriceBook(book.id)).length).toBe(1);
    expect((await priceRuleService.listByService(svc.id)).length).toBe(1);
  });

  it("list categories by org", async () => {
    await seedCategory("ListCat");
    expect((await categoryService.listByOrganization(orgId)).length).toBe(1);
  });
});
