import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const calendars = pgTable(
  "calendars",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    timezone: text("timezone").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("calendars_organization_idx").on(table.organizationId),
    statusIndex: index("calendars_status_idx").on(table.status),
    orgNameUnique: uniqueIndex("calendars_org_name_unique").on(table.organizationId, table.name),
  }),
);

export const schedules = pgTable(
  "schedules",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    name: text("name").notNull(),
    timezone: text("timezone").notNull(),
    status: text("status").notNull(),
    calendarId: uuid("calendar_id").notNull(),
    purpose: text("purpose"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("schedules_organization_idx").on(table.organizationId),
    calendarIndex: index("schedules_calendar_idx").on(table.calendarId),
    statusIndex: index("schedules_status_idx").on(table.status),
  }),
);

export const timeBlocks = pgTable(
  "time_blocks",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    scheduleId: uuid("schedule_id").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    blockType: text("block_type").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("time_blocks_organization_idx").on(table.organizationId),
    scheduleIndex: index("time_blocks_schedule_idx").on(table.scheduleId),
    statusIndex: index("time_blocks_status_idx").on(table.status),
    rangeIndex: index("time_blocks_range_idx").on(table.startAt, table.endAt),
  }),
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    scheduleId: uuid("schedule_id").notNull(),
    timeBlockId: uuid("time_block_id").notNull(),
    title: text("title").notNull(),
    bookingType: text("booking_type"),
    resourceReference: text("resource_reference"),
    status: text("status").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("bookings_organization_idx").on(table.organizationId),
    scheduleIndex: index("bookings_schedule_idx").on(table.scheduleId),
    timeBlockIndex: index("bookings_time_block_idx").on(table.timeBlockId),
    statusIndex: index("bookings_status_idx").on(table.status),
  }),
);

export const shifts = pgTable(
  "shifts",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    name: text("name").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    workingPatternId: uuid("working_pattern_id").notNull(),
    shiftType: text("shift_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("shifts_organization_idx").on(table.organizationId),
    workingPatternIndex: index("shifts_working_pattern_idx").on(table.workingPatternId),
  }),
);

export const schedulingSchema = {
  calendars,
  schedules,
  timeBlocks,
  bookings,
  shifts,
};
