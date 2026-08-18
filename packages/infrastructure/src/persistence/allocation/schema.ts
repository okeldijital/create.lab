import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const allocations = pgTable(
  "allocations",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    projectId: uuid("project_id").notNull(),
    workOrderId: uuid("work_order_id").notNull(),
    resourceId: text("resource_id").notNull(),
    resourceType: text("resource_type").notNull(),
    status: text("status").notNull(),
    allocationPercentage: integer("allocation_percentage").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    priority: text("priority").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("allocations_organization_idx").on(table.organizationId),
    projectIndex: index("allocations_project_idx").on(table.projectId),
    workOrderIndex: index("allocations_work_order_idx").on(table.workOrderId),
    resourceIndex: index("allocations_resource_idx").on(table.resourceId),
    statusIndex: index("allocations_status_idx").on(table.status),
    periodIndex: index("allocations_period_idx").on(table.startDate, table.endDate),
  }),
);

export const allocationGroups = pgTable(
  "allocation_groups",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    allocationIds: uuid("allocation_ids").array().notNull(),
    archived: boolean("archived").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("allocation_groups_organization_idx").on(table.organizationId),
    archivedIndex: index("allocation_groups_archived_idx").on(table.archived),
    orgNameUnique: uniqueIndex("allocation_groups_org_name_unique").on(
      table.organizationId,
      table.name,
    ),
  }),
);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    resourceId: text("resource_id").notNull(),
    projectId: uuid("project_id").notNull(),
    requestedBy: text("requested_by").notNull(),
    reservedFrom: timestamp("reserved_from", { withTimezone: true }).notNull(),
    reservedUntil: timestamp("reserved_until", { withTimezone: true }).notNull(),
    status: text("status").notNull(),
    convertedAllocationId: uuid("converted_allocation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("reservations_organization_idx").on(table.organizationId),
    resourceIndex: index("reservations_resource_idx").on(table.resourceId),
    projectIndex: index("reservations_project_idx").on(table.projectId),
    statusIndex: index("reservations_status_idx").on(table.status),
    convertedAllocationIndex: index("reservations_converted_allocation_idx").on(
      table.convertedAllocationId,
    ),
  }),
);

export const allocationSchema = {
  allocations,
  allocationGroups,
  reservations,
};
