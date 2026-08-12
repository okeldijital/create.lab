import { describe, expect, it } from "vitest";
import {
  PriceBook,
  PriceRule,
  Service,
  ServiceCategory,
  asPriceBookId,
  asPriceRuleId,
  asServiceCategoryId,
  asServiceId,
} from "@creative-lab/services";
import type { OrganizationId } from "@creative-lab/organization";
import {
  PriceBookMapper,
  PriceRuleMapper,
  ServiceCategoryMapper,
  ServiceMapper,
} from "../persistence/services/mappers.js";
import { createId } from "./test-helpers.js";

const organizationId = createId() as OrganizationId;
const now = new Date("2026-01-01T00:00:00.000Z");

const category = ServiceCategory.create({
  id: asServiceCategoryId(createId()),
  organizationId,
  name: "Production",
  description: "Production services",
  now,
});

const priceBook = PriceBook.create({
  id: asPriceBookId(createId()),
  organizationId,
  name: "South Africa 2026",
  currency: "ZAR",
  effectiveFrom: now,
  now,
});

const service = Service.create({
  id: asServiceId(createId()),
  organizationId,
  serviceCode: "PROD-001",
  name: "Production",
  description: "Full production",
  categoryId: category.id,
  defaultPriceBookId: priceBook.id,
  now,
});

const priceRule = PriceRule.create({
  id: asPriceRuleId(createId()),
  organizationId,
  priceBookId: priceBook.id,
  serviceId: service.id,
  basePriceMinor: 300000,
  minimumPriceMinor: 250000,
  maximumPriceMinor: 400000,
  currency: "ZAR",
  now,
});

function createId(): string {
  return crypto.randomUUID();
}

describe("Services persistence mappers", () => {
  it("round-trips Service", () => {
    const restored = ServiceMapper.fromRow(ServiceMapper.toRow(service));
    expect(restored.toSnapshot()).toEqual(service.toSnapshot());
  });

  it("round-trips ServiceCategory", () => {
    const restored = ServiceCategoryMapper.fromRow(ServiceCategoryMapper.toRow(category));
    expect(restored.toSnapshot()).toEqual(category.toSnapshot());
  });

  it("round-trips PriceBook", () => {
    const restored = PriceBookMapper.fromRow(PriceBookMapper.toRow(priceBook));
    expect(restored.toSnapshot()).toEqual(priceBook.toSnapshot());
  });

  it("round-trips PriceRule and preserves minor-unit amounts", () => {
    const restored = PriceRuleMapper.fromRow(PriceRuleMapper.toRow(priceRule));
    expect(restored.toSnapshot()).toEqual(priceRule.toSnapshot());
    expect(restored.basePrice.minorUnits).toBe(300000);
    expect(restored.minimumPrice.minorUnits).toBe(250000);
    expect(restored.maximumPrice.minorUnits).toBe(400000);
  });
});
