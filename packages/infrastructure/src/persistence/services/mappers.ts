import {
  PriceBook,
  type PriceBookSnapshot,
  PriceRule,
  type PriceRuleSnapshot,
  Service,
  type ServiceCategorySnapshot,
  ServiceCategory,
  type ServiceSnapshot,
  asPriceBookId,
  asPriceRuleId,
  asServiceCategoryId,
  asServiceId,
} from "@creative-lab/services";
import type { InferSelectModel } from "drizzle-orm";
import type { OrganizationId } from "@creative-lab/organization";
import type { priceBooks, priceRules, serviceCategories, services } from "./schema.js";

type ServiceRow = InferSelectModel<typeof services>;
type CategoryRow = InferSelectModel<typeof serviceCategories>;
type PriceBookRow = InferSelectModel<typeof priceBooks>;
type PriceRuleRow = InferSelectModel<typeof priceRules>;

export const ServiceMapper = {
  toRow(service: Service): ServiceRow {
    const s = service.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      serviceCode: s.serviceCode,
      name: s.name,
      description: s.description,
      categoryId: s.categoryId,
      defaultPriceBookId: s.defaultPriceBookId,
      pricingModel: s.pricingModel,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archivedAt: s.archivedAt,
    };
  },
  fromRow(row: ServiceRow): Service {
    const snapshot: ServiceSnapshot = {
      id: asServiceId(row.id),
      organizationId: row.organizationId as OrganizationId,
      serviceCode: row.serviceCode,
      name: row.name,
      description: row.description ?? null,
      categoryId: asServiceCategoryId(row.categoryId),
      defaultPriceBookId: row.defaultPriceBookId ? asPriceBookId(row.defaultPriceBookId) : null,
      pricingModel: row.pricingModel as ServiceSnapshot["pricingModel"],
      status: row.status as ServiceSnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
    };
    return Service.reconstitute(snapshot);
  },
};

export const ServiceCategoryMapper = {
  toRow(category: ServiceCategory): CategoryRow {
    const s = category.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      name: s.name,
      description: s.description,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archivedAt: s.archivedAt,
    };
  },
  fromRow(row: CategoryRow): ServiceCategory {
    const snapshot: ServiceCategorySnapshot = {
      id: asServiceCategoryId(row.id),
      organizationId: row.organizationId as OrganizationId,
      name: row.name,
      description: row.description ?? null,
      status: row.status as ServiceCategorySnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
    };
    return ServiceCategory.reconstitute(snapshot);
  },
};

export const PriceBookMapper = {
  toRow(priceBook: PriceBook): PriceBookRow {
    const s = priceBook.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      name: s.name,
      currency: s.currency,
      effectiveFrom: s.effectiveFrom,
      effectiveTo: s.effectiveTo,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archivedAt: s.archivedAt,
    };
  },
  fromRow(row: PriceBookRow): PriceBook {
    const snapshot: PriceBookSnapshot = {
      id: asPriceBookId(row.id),
      organizationId: row.organizationId as OrganizationId,
      name: row.name,
      currency: row.currency,
      effectiveFrom: new Date(row.effectiveFrom),
      effectiveTo: row.effectiveTo ? new Date(row.effectiveTo) : null,
      status: row.status as PriceBookSnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
    };
    return PriceBook.reconstitute(snapshot);
  },
};

export const PriceRuleMapper = {
  toRow(rule: PriceRule): PriceRuleRow {
    const s = rule.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      priceBookId: s.priceBookId,
      serviceId: s.serviceId,
      basePriceMinor: s.basePriceMinor,
      minimumPriceMinor: s.minimumPriceMinor,
      maximumPriceMinor: s.maximumPriceMinor,
      currency: s.currency,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archivedAt: s.archivedAt,
    };
  },
  fromRow(row: PriceRuleRow): PriceRule {
    const snapshot: PriceRuleSnapshot = {
      id: asPriceRuleId(row.id),
      organizationId: row.organizationId as OrganizationId,
      priceBookId: asPriceBookId(row.priceBookId),
      serviceId: asServiceId(row.serviceId),
      basePriceMinor: row.basePriceMinor,
      minimumPriceMinor: row.minimumPriceMinor,
      maximumPriceMinor: row.maximumPriceMinor,
      currency: row.currency,
      status: row.status as PriceRuleSnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
    };
    return PriceRule.reconstitute(snapshot);
  },
};
