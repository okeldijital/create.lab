import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const capacityProfiles = pgTable(
  "capacity_profiles",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    resourceId: uuid("resource_id").notNull(),
    resourceType: text("resource_type").notNull(),
    availabilityProfileId: uuid("availability_profile_id"),
    workingPatternId: uuid("working_pattern_id"),
    status: text("status").notNull(),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    resourceEffectiveUnique: uniqueIndex("capacity_profiles_resource_effective_unique").on(
      table.organizationId,
      table.resourceId,
      table.effectiveFrom,
    ),
  }),
);

export const capabilities = pgTable(
  "capabilities",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    capacityProfileId: uuid("capacity_profile_id").notNull(),
    name: text("name").notNull(),
    proficiency: text("proficiency").notNull(),
    certification: text("certification"),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    active: boolean("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    activeProfileNameUnique: uniqueIndex("capabilities_active_profile_name_unique").on(
      table.capacityProfileId,
      table.name,
      table.active,
    ),
  }),
);

export const availabilityProfiles = pgTable("availability_profiles", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  workingDays: jsonb("working_days").notNull(),
  workingHoursStart: text("working_hours_start").notNull(),
  workingHoursEnd: text("working_hours_end").notNull(),
  exceptions: jsonb("exceptions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const workingPatterns = pgTable("working_patterns", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  hoursPerWeek: numeric("hours_per_week", { precision: 8, scale: 3 }).notNull(),
  hoursPerDay: numeric("hours_per_day", { precision: 8, scale: 3 }).notNull(),
  daysPerWeek: integer("days_per_week").notNull(),
  overtimeAllowed: boolean("overtime_allowed").notNull(),
  remoteAllowed: boolean("remote_allowed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const resourceCapacities = pgTable("resource_capacities", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  capacityProfileId: uuid("capacity_profile_id").notNull(),
  capacityType: text("capacity_type").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  unit: text("unit").notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const capacitySchema = {
  capacityProfiles,
  capabilities,
  availabilityProfiles,
  workingPatterns,
  resourceCapacities,
};
