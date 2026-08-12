import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { organizations, departments, teams } from "../organization/schema.js";

export const positions = pgTable(
  "positions",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    title: text("title").notNull(),
    description: text("description"),
    grade: text("grade"),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("positions_organization_idx").on(table.organizationId),
    organizationTitleUnique: uniqueIndex("positions_org_title_unique").on(table.organizationId, table.title),
    statusIndex: index("positions_status_idx").on(table.status),
  }),
);

export const workers = pgTable(
  "workers",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    employeeNumber: text("employee_number").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    preferredName: text("preferred_name"),
    email: text("email").notNull(),
    phone: text("phone"),
    status: text("status").notNull(),
    employmentType: text("employment_type").notNull(),
    positionId: uuid("position_id").references(() => positions.id),
    departmentId: uuid("department_id").notNull().references(() => departments.id),
    teamId: uuid("team_id").references(() => teams.id),
    // Self-reference requires AnyPgColumn to avoid circular inference (TS7022)
    managerId: uuid("manager_id").references((): AnyPgColumn => workers.id),
    dateJoined: timestamp("date_joined", { withTimezone: true }).notNull(),
    dateLeft: timestamp("date_left", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    organizationEmployeeNumberUnique: uniqueIndex("workers_org_employee_number_unique").on(table.organizationId, table.employeeNumber),
    organizationEmailUnique: uniqueIndex("workers_org_email_unique").on(table.organizationId, table.email),
    organizationIndex: index("workers_organization_idx").on(table.organizationId),
    departmentIndex: index("workers_department_idx").on(table.departmentId),
    teamIndex: index("workers_team_idx").on(table.teamId),
    positionIndex: index("workers_position_idx").on(table.positionId),
    managerIndex: index("workers_manager_idx").on(table.managerId),
    statusIndex: index("workers_status_idx").on(table.status),
  }),
);

export const employments = pgTable(
  "employments",
  {
    id: uuid("id").primaryKey(),
    workerId: uuid("worker_id").notNull().references(() => workers.id),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    employmentType: text("employment_type").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    status: text("status").notNull(),
    workingHoursPerWeek: integer("working_hours_per_week").notNull(),
    probationDays: integer("probation_days").notNull(),
    probationActive: boolean("probation_active").notNull(),
    noticePeriodDays: integer("notice_period_days").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("employments_organization_idx").on(table.organizationId),
    workerIndex: index("employments_worker_idx").on(table.workerId),
    statusIndex: index("employments_status_idx").on(table.status),
  }),
);

export const employmentContracts = pgTable(
  "employment_contracts",
  {
    id: uuid("id").primaryKey(),
    employmentId: uuid("employment_id").notNull().references(() => employments.id),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    contractType: text("contract_type").notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    noticePeriodDays: integer("notice_period_days").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("employment_contracts_organization_idx").on(table.organizationId),
    employmentIndex: index("employment_contracts_employment_idx").on(table.employmentId),
    statusIndex: index("employment_contracts_status_idx").on(table.status),
  }),
);

export const reportingRelationships = pgTable(
  "reporting_relationships",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    workerId: uuid("worker_id").notNull().references(() => workers.id),
    managerId: uuid("manager_id").notNull().references(() => workers.id),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("reporting_relationships_organization_idx").on(table.organizationId),
    managerIndex: index("reporting_relationships_manager_idx").on(table.managerId),
    workerIndex: index("reporting_relationships_worker_idx").on(table.workerId),
  }),
);

export const workforceSchema = {
  positions,
  workers,
  employments,
  employmentContracts,
  reportingRelationships,
};
