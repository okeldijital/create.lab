import { bigint, boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { customers, opportunities } from "../crm/schema.js";
import { organizations } from "../organization/schema.js";
import { services } from "../services/schema.js";

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    quoteNumber: text("quote_number").notNull(),
    customerId: uuid("customer_id").notNull().references(() => customers.id),
    opportunityId: uuid("opportunity_id").references(() => opportunities.id),
    currency: text("currency").notNull(),
    status: text("status").notNull(),
    currentVersionId: uuid("current_version_id"),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("quotes_organization_idx").on(table.organizationId),
    customerIndex: index("quotes_customer_idx").on(table.customerId),
    opportunityIndex: index("quotes_opportunity_idx").on(table.opportunityId),
    statusIndex: index("quotes_status_idx").on(table.status),
    currentVersionIndex: index("quotes_current_version_idx").on(table.currentVersionId),
    organizationNumberUnique: uniqueIndex("quotes_org_number_unique").on(table.organizationId, table.quoteNumber),
  }),
);

export const quoteVersions = pgTable(
  "quote_versions",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    quoteId: uuid("quote_id").notNull().references(() => quotes.id),
    versionNumber: bigint("version_number", { mode: "number" }).notNull(),
    lineIds: uuid("line_ids").array().notNull(),
    subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" }).notNull(),
    totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull(),
    locked: boolean("locked").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    quoteIndex: index("quote_versions_quote_idx").on(table.quoteId),
    organizationIndex: index("quote_versions_organization_idx").on(table.organizationId),
    statusIndex: index("quote_versions_status_idx").on(table.status),
    quoteVersionUnique: uniqueIndex("quote_versions_quote_number_unique").on(table.quoteId, table.versionNumber),
  }),
);

export const quoteLines = pgTable(
  "quote_lines",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    quoteVersionId: uuid("quote_version_id").notNull().references(() => quoteVersions.id),
    serviceId: uuid("service_id").notNull().references(() => services.id),
    description: text("description").notNull(),
    quantity: bigint("quantity", { mode: "number" }).notNull(),
    unitPriceMinor: bigint("unit_price_minor", { mode: "number" }).notNull(),
    lineTotalMinor: bigint("line_total_minor", { mode: "number" }).notNull(),
    currency: text("currency").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    versionIndex: index("quote_lines_version_idx").on(table.quoteVersionId),
    organizationIndex: index("quote_lines_organization_idx").on(table.organizationId),
    serviceIndex: index("quote_lines_service_idx").on(table.serviceId),
  }),
);

export const quoteApprovals = pgTable(
  "quote_approvals",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    quoteId: uuid("quote_id").notNull().references(() => quotes.id),
    decision: text("decision").notNull(),
    decisionDate: timestamp("decision_date", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    quoteIndex: index("quote_approvals_quote_idx").on(table.quoteId),
    organizationIndex: index("quote_approvals_organization_idx").on(table.organizationId),
    decisionIndex: index("quote_approvals_decision_idx").on(table.decision),
  }),
);

export const quotationSchema = {
  quotes,
  quoteVersions,
  quoteLines,
  quoteApprovals,
};
