import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "../organization/schema.js";

export const serviceCategories = pgTable(
  "service_categories",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("service_categories_organization_idx").on(table.organizationId),
    organizationNameUnique: uniqueIndex("service_categories_org_name_unique").on(table.organizationId, table.name),
    statusIndex: index("service_categories_status_idx").on(table.status),
  }),
);

export const priceBooks = pgTable(
  "price_books",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: text("name").notNull(),
    currency: text("currency").notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("price_books_organization_idx").on(table.organizationId),
    statusIndex: index("price_books_status_idx").on(table.status),
    currencyIndex: index("price_books_currency_idx").on(table.organizationId, table.currency),
  }),
);

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    serviceCode: text("service_code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    categoryId: uuid("category_id").notNull().references(() => serviceCategories.id),
    defaultPriceBookId: uuid("default_price_book_id").references(() => priceBooks.id),
    pricingModel: text("pricing_model").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationCodeUnique: uniqueIndex("services_org_code_unique").on(table.organizationId, table.serviceCode),
    organizationIndex: index("services_organization_idx").on(table.organizationId),
    categoryIndex: index("services_category_idx").on(table.categoryId),
    statusIndex: index("services_status_idx").on(table.status),
  }),
);

export const priceRules = pgTable(
  "price_rules",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    priceBookId: uuid("price_book_id").notNull().references(() => priceBooks.id),
    serviceId: uuid("service_id").notNull().references(() => services.id),
    basePriceMinor: bigint("base_price_minor", { mode: "number" }).notNull(),
    minimumPriceMinor: bigint("minimum_price_minor", { mode: "number" }).notNull(),
    maximumPriceMinor: bigint("maximum_price_minor", { mode: "number" }).notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("price_rules_organization_idx").on(table.organizationId),
    priceBookIndex: index("price_rules_price_book_idx").on(table.priceBookId),
    serviceIndex: index("price_rules_service_idx").on(table.serviceId),
    statusIndex: index("price_rules_status_idx").on(table.status),
  }),
);

export const servicesSchema = {
  serviceCategories,
  services,
  priceBooks,
  priceRules,
};
