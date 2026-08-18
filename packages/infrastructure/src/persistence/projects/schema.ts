import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    projectType: text("project_type").notNull(),
    priority: text("priority").notNull(),
    status: text("status").notNull(),
    ownerId: text("owner_id").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    targetEndDate: timestamp("target_end_date", { withTimezone: true }),
    actualEndDate: timestamp("actual_end_date", { withTimezone: true }),
    budgetReference: text("budget_reference"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => ({
    organizationIndex: index("projects_organization_idx").on(table.organizationId),
    statusIndex: index("projects_status_idx").on(table.status),
    ownerIndex: index("projects_owner_idx").on(table.ownerId),
    orgNameUnique: uniqueIndex("projects_org_name_unique").on(table.organizationId, table.name),
  }),
);

export const projectPhases = pgTable(
  "project_phases",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    projectId: uuid("project_id").notNull(),
    name: text("name").notNull(),
    sequence: integer("sequence").notNull(),
    status: text("status").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("project_phases_organization_idx").on(table.organizationId),
    projectIndex: index("project_phases_project_idx").on(table.projectId),
    statusIndex: index("project_phases_status_idx").on(table.status),
    projectSequenceUnique: uniqueIndex("project_phases_project_sequence_unique").on(
      table.projectId,
      table.sequence,
    ),
  }),
);

export const projectObjectives = pgTable(
  "project_objectives",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    projectId: uuid("project_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull(),
    targetValue: numeric("target_value", { precision: 18, scale: 6 }).notNull(),
    currentValue: numeric("current_value", { precision: 18, scale: 6 }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("project_objectives_organization_idx").on(table.organizationId),
    projectIndex: index("project_objectives_project_idx").on(table.projectId),
    statusIndex: index("project_objectives_status_idx").on(table.status),
    projectNameUnique: uniqueIndex("project_objectives_project_name_unique").on(
      table.projectId,
      table.name,
    ),
  }),
);

export const projectDependencies = pgTable(
  "project_dependencies",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    projectId: uuid("project_id").notNull(),
    dependsOnProjectId: uuid("depends_on_project_id").notNull(),
    dependencyType: text("dependency_type").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("project_dependencies_organization_idx").on(table.organizationId),
    projectIndex: index("project_dependencies_project_idx").on(table.projectId),
    dependsOnIndex: index("project_dependencies_depends_on_idx").on(table.dependsOnProjectId),
    statusIndex: index("project_dependencies_status_idx").on(table.status),
  }),
);

export const deliverables = pgTable(
  "deliverables",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    projectId: uuid("project_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    workOrderReferences: uuid("work_order_references").array().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("deliverables_organization_idx").on(table.organizationId),
    projectIndex: index("deliverables_project_idx").on(table.projectId),
    statusIndex: index("deliverables_status_idx").on(table.status),
    projectNameUnique: uniqueIndex("deliverables_project_name_unique").on(table.projectId, table.name),
  }),
);

export const projectsSchema = {
  projects,
  projectPhases,
  projectObjectives,
  projectDependencies,
  deliverables,
};
