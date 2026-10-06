import { bigint, doublePrecision, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { customers } from "../crm/schema.js";
import { organizations } from "../organization/schema.js";
import { projects } from "../projects/schema.js";

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  deliveryId: uuid("delivery_id").notNull(),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  invoiceNumber: text("invoice_number").notNull(),
  issueDate: timestamp("issue_date", { withTimezone: true }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  currency: text("currency").notNull(),
  subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
  taxMinor: bigint("tax_minor", { mode: "number" }).notNull(),
  discountMinor: bigint("discount_minor", { mode: "number" }).notNull(),
  totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
  balanceMinor: bigint("balance_minor", { mode: "number" }).notNull(),
  paidMinor: bigint("paid_minor", { mode: "number" }).notNull(),
  creditedMinor: bigint("credited_minor", { mode: "number" }).notNull(),
  lineIds: uuid("line_ids").array().notNull(),
  status: text("status").notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  organizationIndex: index("invoices_organization_idx").on(table.organizationId),
  projectIndex: index("invoices_project_idx").on(table.projectId),
  deliveryIndex: index("invoices_delivery_idx").on(table.deliveryId),
  customerIndex: index("invoices_customer_idx").on(table.customerId),
  statusIndex: index("invoices_status_idx").on(table.status),
  organizationNumberUnique: uniqueIndex("invoices_org_number_unique").on(table.organizationId, table.invoiceNumber),
}));

export const invoiceLines = pgTable("invoice_lines", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unitPriceMinor: bigint("unit_price_minor", { mode: "number" }).notNull(),
  discountMinor: bigint("discount_minor", { mode: "number" }).notNull(),
  taxRate: doublePrecision("tax_rate").notNull(),
  lineTotalMinor: bigint("line_total_minor", { mode: "number" }).notNull(),
  currency: text("currency").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => ({
  organizationIndex: index("invoice_lines_organization_idx").on(table.organizationId),
  invoiceIndex: index("invoice_lines_invoice_idx").on(table.invoiceId),
}));

export const billingSchema = { invoices, invoiceLines };
