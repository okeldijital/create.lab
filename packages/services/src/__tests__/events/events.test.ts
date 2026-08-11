import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { PriceBookStatus } from "../../enums/PriceBookStatus.js";
import { ServiceStatus } from "../../enums/ServiceStatus.js";
import {
  CategoryArchived,
  CategoryCreated,
  PriceBookCreated,
  PriceBookPublished,
  PriceBookRetired,
  PriceRuleArchived,
  PriceRuleCreated,
  PriceRuleUpdated,
  ServiceActivated,
  ServiceArchived,
  ServiceCreated,
} from "../../events/services-events.js";
import {
  asPriceBookId,
  asPriceRuleId,
  asServiceCategoryId,
  asServiceId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");

describe("Domain events", () => {
  it("ServiceCreated frozen versioned payload", () => {
    const e = ServiceCreated.create({
      organizationId: orgId,
      serviceId: asServiceId("s1"),
      serviceCode: "MIX",
      name: "Mix",
      status: ServiceStatus.DRAFT,
    });
    expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.payload)).toBe(true);
    expect(e.payload.serviceCode).toBe("MIX");
  });

  it("covers services event set", () => {
    const events = [
      ServiceActivated.create({
        organizationId: orgId,
        serviceId: asServiceId("s1"),
      }),
      ServiceArchived.create({
        organizationId: orgId,
        serviceId: asServiceId("s1"),
      }),
      CategoryCreated.create({
        organizationId: orgId,
        categoryId: asServiceCategoryId("c1"),
        name: "Audio",
      }),
      CategoryArchived.create({
        organizationId: orgId,
        categoryId: asServiceCategoryId("c1"),
      }),
      PriceBookCreated.create({
        organizationId: orgId,
        priceBookId: asPriceBookId("pb1"),
        name: "Book",
        currency: "USD",
        status: PriceBookStatus.DRAFT,
      }),
      PriceBookPublished.create({
        organizationId: orgId,
        priceBookId: asPriceBookId("pb1"),
        currency: "USD",
      }),
      PriceBookRetired.create({
        organizationId: orgId,
        priceBookId: asPriceBookId("pb1"),
      }),
      PriceRuleCreated.create({
        organizationId: orgId,
        priceRuleId: asPriceRuleId("pr1"),
        priceBookId: asPriceBookId("pb1"),
        serviceId: asServiceId("s1"),
        basePriceMinor: 100,
      }),
      PriceRuleUpdated.create({
        organizationId: orgId,
        priceRuleId: asPriceRuleId("pr1"),
        basePriceMinor: 120,
        minimumPriceMinor: 100,
        maximumPriceMinor: 200,
      }),
      PriceRuleArchived.create({
        organizationId: orgId,
        priceRuleId: asPriceRuleId("pr1"),
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.payload)).toBe(true);
    }
  });
});
