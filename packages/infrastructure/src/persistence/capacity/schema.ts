import { boolean, check, index, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organizations } from "../organization/schema.js";

export const capacityProfiles = pgTable("capacity_profiles", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  resourceId: uuid("resource_id").notNull(),
  resourceType: text("resource_type").notNull(),
  availabilityProfileId: uuid("availability_profile_id"),
  workingPatternId: uuid("working_pattern_id"),
  status: text("status").notNull(),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  organizationIndex: index("capacity_profiles_organization_idx").on(table.organizationId),
  resourceIndex: index("capacity_profiles_resource_idx").on(table.resourceId),
  statusIndex: index("capacity_profiles_status_idx").on(table.status),
  effectiveRangeCheck: check("capacity_profiles_effective_range_check", `effective_to IS NULL OR effective_to >= effective_from`),
}));

export const capabilities = pgTable("capabilities", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  capacityProfileId: uuid("capacity_profile_id").notNull().references(() => capacityProfiles.id),
  name: text("name").notNull(),
  proficiency: text("proficiency").notNull(),
  certification: text("certification"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  active: boolean("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  organizationIndex: index("capabilities_organization_idx").on(table.organizationId),
  profileIndex: index("capabilities_profile_idx").on(table.capacityProfileId),
  activeNameUnique: uniqueIndex("capabilities_profile_name_active_unique").on(table.capacityProfileId, table.name, table.active),
  effectiveRangeCheck: check("capabilities_effective_range_check", `effective_to IS NULL OR effective_to >= effective_from`),
}));

export const availabilityProfiles = pgTable("availability_profiles", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  workingDays: jsonb("working_days").notNull(),
  workingHoursStart: text("working_hours_start").notNull(),
  workingHoursEnd: text("working_hours_end").notNull(),
  exceptions: jsonb("exceptions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  organizationIndex: index("availability_profiles_organization_idx").on(table.organizationId),
  organizationNameUnique: uniqueIndex("availability_profiles_org_name_unique").on(table.organizationId, table.name),
}));

export const workingPatterns = pgTable("working_patterns", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  hoursPerWeek: numeric("hours_per_week", { precision: 8, scale: 2 }).notNull(),
  hoursPerDay: numeric("hours_per_day", { precision: 8, scale: 2 }).notNull(),
  daysPerWeek: numeric("days_per_week", { precision: 2, scale: 0 }).notNull(),
  overtimeAllowed: boolean("overtime_allowed").notNull(),
  remoteAllowed: boolean("remote_allowed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  organizationIndex: index("working_patterns_organization_idx").on(table.organizationId),
  daysCheck: check("working_patterns_days_check", "days_per_week BETWEEN 1 AND 7"),
  hoursPositiveCheck: check("working_patterns_hours_positive_check", "hours_per_week > 0 AND hours_per_day > 0"),
}));

export const resourceCapacities = pgTable("resource_capacities", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  capacityProfileId: uuid("capacity_profile_id").notNull().references(() => capacityProfiles.id),
  capacityType: text("capacity_type").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  organizationIndex: index("resource_capacities_organization_idx").on(table.organizationId),
  profileIndex: index("resource_capacities_profile_idx").on(table.capacityProfileId),
  effectiveRangeCheck: check("resource_capacities_effective_range_check", `effective_to IS NULL OR effective_to >= effective_from`),
  quantityPositiveCheck: check("resource_capacities_quantity_positive_check", "quantity > 0"),
}));

export const capacitySchema = { capacityProfiles, capabilities, availabilityProfiles, workingPatterns, resourceCapacities };
