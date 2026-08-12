import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const workOrders = pgTable(
  "work_orders",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    allocationId: uuid("allocation_id").notNull(),
    bookingId: uuid("booking_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority").notNull(),
    status: text("status").notNull(),
    plannedStart: timestamp("planned_start", { withTimezone: true }).notNull(),
    plannedEnd: timestamp("planned_end", { withTimezone: true }).notNull(),
    actualStart: timestamp("actual_start", { withTimezone: true }),
    actualEnd: timestamp("actual_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("work_orders_organization_idx").on(table.organizationId),
    allocationIndex: index("work_orders_allocation_idx").on(table.allocationId),
    bookingIndex: index("work_orders_booking_idx").on(table.bookingId),
    statusIndex: index("work_orders_status_idx").on(table.status),
  }),
);

export const workSessions = pgTable(
  "work_sessions",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    workOrderId: uuid("work_order_id").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    status: text("status").notNull(),
    durationMs: bigint("duration_ms", { mode: "number" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("work_sessions_organization_idx").on(table.organizationId),
    workOrderIndex: index("work_sessions_work_order_idx").on(table.workOrderId),
    statusIndex: index("work_sessions_status_idx").on(table.status),
  }),
);

export const workMilestones = pgTable(
  "work_milestones",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    workOrderId: uuid("work_order_id").notNull(),
    name: text("name").notNull(),
    completed: boolean("completed").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedBy: text("completed_by"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("work_milestones_organization_idx").on(table.organizationId),
    workOrderIndex: index("work_milestones_work_order_idx").on(table.workOrderId),
    completedIndex: index("work_milestones_completed_idx").on(table.completed),
  }),
);

export const workOutputs = pgTable(
  "work_outputs",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    workOrderId: uuid("work_order_id").notNull(),
    name: text("name").notNull(),
    outputType: text("output_type").notNull(),
    version: integer("version").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("work_outputs_organization_idx").on(table.organizationId),
    workOrderIndex: index("work_outputs_work_order_idx").on(table.workOrderId),
    statusIndex: index("work_outputs_status_idx").on(table.status),
    orderNameVersionUnique: uniqueIndex("work_outputs_order_name_version_unique").on(
      table.workOrderId,
      table.name,
      table.version,
    ),
  }),
);

export const workIncidents = pgTable(
  "work_incidents",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    workOrderId: uuid("work_order_id").notNull(),
    incidentType: text("incident_type").notNull(),
    severity: text("severity").notNull(),
    description: text("description").notNull(),
    reportedAt: timestamp("reported_at", { withTimezone: true }).notNull(),
    resolved: boolean("resolved").notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolution: text("resolution"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("work_incidents_organization_idx").on(table.organizationId),
    workOrderIndex: index("work_incidents_work_order_idx").on(table.workOrderId),
    resolvedIndex: index("work_incidents_resolved_idx").on(table.resolved),
  }),
);

export const operationsSchema = {
  workOrders,
  workSessions,
  workMilestones,
  workOutputs,
  workIncidents,
};
