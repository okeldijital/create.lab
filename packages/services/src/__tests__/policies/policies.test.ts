import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { PriceBook } from "../../aggregates/PriceBook/PriceBook.js";
import { PriceRule } from "../../aggregates/PriceRule/PriceRule.js";
import { Service } from "../../aggregates/Service/Service.js";
import { ServiceCategory } from "../../aggregates/ServiceCategory/ServiceCategory.js";
import { PriceBookStatus } from "../../enums/PriceBookStatus.js";
import { ServiceStatus } from "../../enums/ServiceStatus.js";
import {
  CategoryInUseError,
  DuplicateCategoryNameError,
  DuplicatePriceRuleError,
  InvalidServiceStateError,
  PublishedPriceBookExistsError,
} from "../../errors/ServicesErrors.js";
import { CategoryPolicy } from "../../policies/CategoryPolicy.js";
import { PriceBookPolicy } from "../../policies/PriceBookPolicy.js";
import { PriceRulePolicy } from "../../policies/PriceRulePolicy.js";
import { ServiceLifecyclePolicy } from "../../policies/ServiceLifecyclePolicy.js";

const orgId = asOrganizationId("org-1");

describe("ServiceLifecyclePolicy", () => {
  it("allows activate from draft", () => {
    const cat = ServiceCategory.create({
      organizationId: orgId,
      name: "C",
    });
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "A",
      name: "A",
      categoryId: cat.id,
    });
    ServiceLifecyclePolicy.assertCanActivate(s);
    s.activate();
    expect(() =>
      ServiceLifecyclePolicy.assertCanTransition(s, ServiceStatus.DRAFT),
    ).toThrow(InvalidServiceStateError);
  });
});

describe("CategoryPolicy", () => {
  it("unique names", () => {
    const a = ServiceCategory.create({
      organizationId: orgId,
      name: "Audio",
    });
    expect(() =>
      CategoryPolicy.assertUniqueName(orgId, "audio", [a]),
    ).toThrow(DuplicateCategoryNameError);
  });

  it("blocks archive with active services", () => {
    const cat = ServiceCategory.create({
      organizationId: orgId,
      name: "C",
    });
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "X",
      name: "X",
      categoryId: cat.id,
    });
    s.activate();
    expect(() => CategoryPolicy.assertCanArchive(cat, [s])).toThrow(
      CategoryInUseError,
    );
  });

  it("allows archive when services not active", () => {
    const cat = ServiceCategory.create({
      organizationId: orgId,
      name: "C2",
    });
    const s = Service.create({
      organizationId: orgId,
      serviceCode: "Y",
      name: "Y",
      categoryId: cat.id,
    });
    expect(() => CategoryPolicy.assertCanArchive(cat, [s])).not.toThrow();
  });
});

describe("PriceBookPolicy", () => {
  it("one published per currency", () => {
    const a = PriceBook.create({
      organizationId: orgId,
      name: "A",
      currency: "USD",
    });
    a.publish();
    const b = PriceBook.create({
      organizationId: orgId,
      name: "B",
      currency: "USD",
    });
    expect(() => PriceBookPolicy.assertCanPublish(b, [a])).toThrow(
      PublishedPriceBookExistsError,
    );
  });

  it("allows publish when different currency", () => {
    const a = PriceBook.create({
      organizationId: orgId,
      name: "A",
      currency: "USD",
    });
    a.publish();
    const b = PriceBook.create({
      organizationId: orgId,
      name: "B",
      currency: "EUR",
    });
    expect(() => PriceBookPolicy.assertCanPublish(b, [a])).not.toThrow();
  });

  it("retire transition", () => {
    const a = PriceBook.create({
      organizationId: orgId,
      name: "A",
      currency: "GBP",
    });
    expect(() =>
      PriceBookPolicy.assertCanTransition(a, PriceBookStatus.RETIRED),
    ).toThrow(InvalidServiceStateError);
    a.publish();
    PriceBookPolicy.assertCanTransition(a, PriceBookStatus.RETIRED);
  });
});

describe("PriceRulePolicy", () => {
  it("validates range and duplicates", () => {
    const book = PriceBook.create({
      organizationId: orgId,
      name: "B",
      currency: "USD",
    });
    const cat = ServiceCategory.create({
      organizationId: orgId,
      name: "C",
    });
    const svc = Service.create({
      organizationId: orgId,
      serviceCode: "Z",
      name: "Z",
      categoryId: cat.id,
    });
    const rule = PriceRule.create({
      organizationId: orgId,
      priceBookId: book.id,
      serviceId: svc.id,
      basePriceMinor: 100,
      currency: "USD",
    });
    expect(() =>
      PriceRulePolicy.assertNoDuplicate(svc.id, book.id, [rule]),
    ).toThrow(DuplicatePriceRuleError);
    PriceRulePolicy.assertCurrencyMatchesBook(book, "usd");
    expect(() =>
      PriceRulePolicy.assertCurrencyMatchesBook(book, "EUR"),
    ).toThrow(InvalidServiceStateError);
  });

  it("assertValidRange happy path", () => {
    const range = PriceRulePolicy.assertValidRange({
      basePriceMinor: 100,
      minimumPriceMinor: 50,
      maximumPriceMinor: 200,
      currency: "USD",
    });
    expect(range.base.minorUnits).toBe(100);
  });

  it("blocks archive of archived category rename", () => {
    const cat = ServiceCategory.create({
      organizationId: orgId,
      name: "Gone",
    });
    cat.archive();
    expect(() => CategoryPolicy.assertMutable(cat)).toThrow(
      InvalidServiceStateError,
    );
  });
});
