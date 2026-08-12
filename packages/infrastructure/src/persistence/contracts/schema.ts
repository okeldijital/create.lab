import { bigint, boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organizations } from "../organization/schema.js";
import { customers } from "../crm/schema.js";
import { quotes } from "../quotation/schema.js";

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    contractNumber: text("contract_number").notNull(),
    customerId: uuid("customer_id").notNull().references(() => customers.id),
    quotationId: uuid("quotation_id").notNull().references(() => quotes.id),
    status: text("status").notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    currentVersionId: uuid("current_version_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("contracts_organization_idx").on(table.organizationId),
    customerIndex: index("contracts_customer_idx").on(table.customerId),
    quotationIndex: index("contracts_quotation_idx").on(table.quotationId),
    statusIndex: index("contracts_status_idx").on(table.status),
    currentVersionIndex: index("contracts_current_version_idx").on(table.currentVersionId),
    organizationNumberUnique: uniqueIndex("contracts_org_number_unique").on(table.organizationId, table.contractNumber),
  }),
);

export const contractVersions = pgTable(
  "contract_versions",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    contractId: uuid("contract_id").notNull().references(() => contracts.id),
    versionNumber: bigint("version_number", { mode: "number" }).notNull(),
    termIds: uuid("term_ids").array().notNull(),
    status: text("status").notNull(),
    locked: boolean("locked").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    contractIndex: index("contract_versions_contract_idx").on(table.contractId),
    organizationIndex: index("contract_versions_organization_idx").on(table.organizationId),
    statusIndex: index("contract_versions_status_idx").on(table.status),
    contractVersionUnique: uniqueIndex("contract_versions_contract_number_unique").on(table.contractId, table.versionNumber),
  }),
);

export const contractTerms = pgTable(
  "contract_terms",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    contractVersionId: uuid("contract_version_id").notNull().references(() => contractVersions.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    mandatory: boolean("mandatory").notNull(),
    termOrder: bigint("term_order", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    versionIndex: index("contract_terms_version_idx").on(table.contractVersionId),
    organizationIndex: index("contract_terms_organization_idx").on(table.organizationId),
    orderUnique: uniqueIndex("contract_terms_version_order_unique").on(table.contractVersionId, table.termOrder),
  }),
);

export const contractAmendments = pgTable(
  "contract_amendments",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    contractId: uuid("contract_id").notNull().references(() => contracts.id),
    reason: text("reason").notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    status: text("status").notNull(),
    resultingVersionId: uuid("resulting_version_id").references(() => contractVersions.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    contractIndex: index("contract_amendments_contract_idx").on(table.contractId),
    organizationIndex: index("contract_amendments_organization_idx").on(table.organizationId),
    statusIndex: index("contract_amendments_status_idx").on(table.status),
    resultingVersionIndex: index("contract_amendments_resulting_version_idx").on(table.resultingVersionId),
  }),
);

export const contractsSchema = { contracts, contractVersions, contractTerms, contractAmendments };
