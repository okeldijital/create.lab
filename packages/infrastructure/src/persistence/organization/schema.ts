import { pgTable, text, integer, timestamp, jsonb, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    displayName: text("display_name").notNull(),
    legalName: text("legal_name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    timezone: text("timezone").notNull(),
    locale: text("locale").notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull(),
    branding: jsonb("branding").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({ slugUnique: uniqueIndex("organizations_slug_unique").on(table.slug) }),
);

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description"),
    parentDepartmentId: uuid("parent_department_id"),
    headId: uuid("head_id"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    orgNameUnique: uniqueIndex("departments_org_name_unique").on(table.organizationId, table.name),
  }),
);

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    departmentId: uuid("department_id").notNull().references(() => departments.id),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    departmentNameUnique: uniqueIndex("teams_department_name_unique").on(table.departmentId, table.name),
  }),
);

export const studios = pgTable(
  "studios",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").notNull(),
    capacity: integer("capacity").notNull(),
    location: text("location"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    orgNameUnique: uniqueIndex("studios_org_name_unique").on(table.organizationId, table.name),
  }),
);

export const organizationSettings = pgTable("organization_settings", {
  organizationId: uuid("organization_id").primaryKey().references(() => organizations.id),
  timezone: text("timezone").notNull(),
  locale: text("locale").notNull(),
  currency: text("currency").notNull(),
  workingWeek: text("working_week").array().notNull(),
  workingHours: jsonb("working_hours")
    .$type<{ start: string; end: string }>()
    .notNull(),
  branding: jsonb("branding").$type<Record<string, unknown>>().notNull().default({}),
  policies: jsonb("policies").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const organizationSchema = {
  organizations,
  departments,
  teams,
  studios,
  organizationSettings,
};
