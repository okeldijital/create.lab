import { pgTable, text, integer, boolean, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";
import { organizations } from "../organization/schema.js";

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    customerNumber: text("customer_number").notNull(),
    name: text("name").notNull(),
    legalName: text("legal_name"),
    status: text("status").notNull(),
    industry: text("industry"),
    billingAddress: text("billing_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationCustomerNumberUnique: uniqueIndex("customers_org_number_unique").on(table.organizationId, table.customerNumber),
    organizationIndex: index("customers_organization_idx").on(table.organizationId),
    statusIndex: index("customers_status_idx").on(table.status),
  }),
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    customerId: uuid("customer_id").notNull().references(() => customers.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    role: text("role"),
    isPrimary: boolean("is_primary").notNull().default(false),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    customerEmailUnique: uniqueIndex("contacts_customer_email_unique").on(table.customerId, table.email),
    customerIndex: index("contacts_customer_idx").on(table.customerId),
    primaryIndex: index("contacts_customer_primary_idx").on(table.customerId, table.isPrimary),
  }),
);

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    customerId: uuid("customer_id").notNull().references(() => customers.id),
    title: text("title").notNull(),
    estimatedValueMinor: integer("estimated_value_minor").notNull(),
    probability: integer("probability").notNull(),
    expectedCloseDate: timestamp("expected_close_date", { withTimezone: true }),
    projectId: uuid("project_id"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    customerIndex: index("opportunities_customer_idx").on(table.customerId),
    statusIndex: index("opportunities_status_idx").on(table.status),
  }),
);

export const interactions = pgTable(
  "interactions",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    customerId: uuid("customer_id").notNull().references(() => customers.id),
    contactId: uuid("contact_id").references(() => contacts.id),
    type: text("type").notNull(),
    summary: text("summary").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    customerIndex: index("interactions_customer_idx").on(table.customerId),
    occurredAtIndex: index("interactions_customer_occurred_idx").on(table.customerId, table.occurredAt),
  }),
);

export const crmSchema = { customers, contacts, opportunities, interactions };
