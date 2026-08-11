import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { PriceBook } from "../../aggregates/PriceBook/PriceBook.js";
import { PriceRule } from "../../aggregates/PriceRule/PriceRule.js";
import { Service } from "../../aggregates/Service/Service.js";
import { ServiceCategory } from "../../aggregates/ServiceCategory/ServiceCategory.js";
import { CategoryStatus } from "../../enums/CategoryStatus.js";
import { PriceBookStatus } from "../../enums/PriceBookStatus.js";
import { PricingModel } from "../../enums/PricingModel.js";
import { ServiceStatus } from "../../enums/ServiceStatus.js";
import {
  InvalidPriceRangeError,
  InvalidServiceStateError,
} from "../../errors/ServicesErrors.js";
import {
  CategoryCreated,
  PriceBookCreated,
  PriceBookPublished,
  PriceRuleCreated,
  ServiceActivated,
  ServiceCreated,
} from "../../events/services-events.js";
import {
  asServiceCategoryId,
  asServiceId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const catId = asServiceCategoryId("cat-1");

describe("Service aggregate", () => {
  it("creates DRAFT with event", () => {
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "mix-1",
      name: "Mixing",
      categoryId: catId,
      pricingModel: PricingModel.HOURLY,
    });
    expect(s.status).toBe(ServiceStatus.DRAFT);
    expect(s.serviceCode.value).toBe("MIX-1");
    expect(s.pullDomainEvents()[0]).toBeInstanceOf(ServiceCreated);
  });

  it("lifecycle activate deactivate archive", () => {
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "S1",
      name: "S",
      categoryId: catId,
    });
    s.pullDomainEvents();
    s.activate();
    expect(s.isActive).toBe(true);
    expect(s.pullDomainEvents()[0]).toBeInstanceOf(ServiceActivated);
    s.deactivate();
    expect(s.status).toBe(ServiceStatus.INACTIVE);
    s.activate();
    s.archive();
    expect(s.isArchived).toBe(true);
    expect(() => s.activate()).toThrow(InvalidServiceStateError);
  });

  it("category immutable once active", () => {
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "S2",
      name: "S",
      categoryId: catId,
    });
    s.activate();
    expect(() =>
      s.setCategory(asServiceCategoryId("cat-2")),
    ).toThrow(InvalidServiceStateError);
  });

  it("can change category while draft", () => {
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "S3",
      name: "S",
      categoryId: catId,
    });
    s.setCategory(asServiceCategoryId("cat-2"));
    expect(s.categoryId).toBe("cat-2");
  });

  it("reconstitutes", () => {
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "S4",
      name: "Snap",
      categoryId: catId,
    });
    const r = Service.reconstitute(s.toSnapshot());
    expect(r.name.value).toBe("Snap");
  });

  it("rename and description while mutable", () => {
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "S5",
      name: "Old",
      categoryId: catId,
    });
    s.rename("New");
    s.setDescription("Details");
    expect(s.name.value).toBe("New");
    expect(s.description.value).toBe("Details");
  });

  it("cannot skip activate from draft to inactive", () => {
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "S6",
      name: "S",
      categoryId: catId,
    });
    expect(() => s.deactivate()).toThrow(InvalidServiceStateError);
  });
});

describe("ServiceCategory aggregate", () => {
  it("creates ACTIVE", () => {
    const c = ServiceCategory.create({
      organizationId: orgId,
      name: "Production",
    });
    expect(c.status).toBe(CategoryStatus.ACTIVE);
    expect(c.pullDomainEvents()[0]).toBeInstanceOf(CategoryCreated);
  });

  it("rename and archive immutability", () => {
    const c = ServiceCategory.create({
      organizationId: orgId,
      name: "Old",
    });
    c.rename("New");
    expect(c.name.value).toBe("New");
    c.archive();
    expect(c.isArchived).toBe(true);
    expect(() => c.rename("X")).toThrow(InvalidServiceStateError);
  });
});

describe("PriceBook aggregate", () => {
  it("creates DRAFT and publishes", () => {
    const b = PriceBook.create({
      organizationId: orgId,
      name: "USD 2026",
      currency: "usd",
    });
    expect(b.status).toBe(PriceBookStatus.DRAFT);
    expect(b.currency.code).toBe("USD");
    expect(b.pullDomainEvents()[0]).toBeInstanceOf(PriceBookCreated);
    b.pullDomainEvents();
    b.publish();
    expect(b.isPublished).toBe(true);
    expect(b.pullDomainEvents()[0]).toBeInstanceOf(PriceBookPublished);
  });

  it("effective period immutable after publish", () => {
    const b = PriceBook.create({
      organizationId: orgId,
      name: "B",
      currency: "EUR",
    });
    b.publish();
    expect(() =>
      b.setEffectivePeriod(new Date(), null),
    ).toThrow(InvalidServiceStateError);
  });

  it("retire and archive", () => {
    const b = PriceBook.create({
      organizationId: orgId,
      name: "B",
      currency: "GBP",
    });
    b.publish();
    b.retire();
    expect(b.status).toBe(PriceBookStatus.RETIRED);
    b.archive();
    expect(b.isArchived).toBe(true);
  });

  it("rejects invalid effective range", () => {
    expect(() =>
      PriceBook.create({
        organizationId: orgId,
        name: "B",
        effectiveFrom: new Date("2026-12-01"),
        effectiveTo: new Date("2026-01-01"),
      }),
    ).toThrow(InvalidServiceStateError);
  });
});

describe("PriceRule aggregate", () => {
  it("creates with range", () => {
    const book = PriceBook.create({
      organizationId: orgId,
      name: "B",
      currency: "USD",
    });
    const svc = Service.create({
      organizationId: orgId,
      serviceCode: "PR1",
      name: "P",
      categoryId: catId,
    });
    const rule = PriceRule.create({
      organizationId: orgId,
      priceBookId: book.id,
      serviceId: svc.id,
      basePriceMinor: 10000,
      minimumPriceMinor: 5000,
      maximumPriceMinor: 20000,
      currency: "USD",
    });
    expect(rule.basePrice.minorUnits).toBe(10000);
    expect(rule.pullDomainEvents()[0]).toBeInstanceOf(PriceRuleCreated);
  });

  it("rejects invalid range", () => {
    expect(() =>
      PriceRule.create({
        organizationId: orgId,
        priceBookId: "pb" as never,
        serviceId: asServiceId("s"),
        basePriceMinor: 100,
        minimumPriceMinor: 200,
        currency: "USD",
      }),
    ).toThrow(InvalidPriceRangeError);
  });

  it("update pricing and archive", () => {
    const book = PriceBook.create({
      organizationId: orgId,
      name: "B",
      currency: "USD",
    });
    const svc = Service.create({
      organizationId: orgId,
      serviceCode: "PR2",
      name: "P",
      categoryId: catId,
    });
    const rule = PriceRule.create({
      organizationId: orgId,
      priceBookId: book.id,
      serviceId: svc.id,
      basePriceMinor: 1000,
      currency: "USD",
    });
    rule.updatePricing({ basePriceMinor: 1500, maximumPriceMinor: 3000 });
    expect(rule.basePrice.minorUnits).toBe(1500);
    rule.archive();
    expect(rule.isArchived).toBe(true);
    expect(() =>
      rule.updatePricing({ basePriceMinor: 1 }),
    ).toThrow(InvalidServiceStateError);
  });
});
