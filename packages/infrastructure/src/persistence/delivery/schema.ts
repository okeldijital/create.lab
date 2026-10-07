import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const deliveries = pgTable(
  "deliveries",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    projectId: uuid("project_id").notNull(),
    productionId: uuid("production_id").notNull(),
    reviewId: uuid("review_id").notNull(),
    packageId: uuid("package_id"),
    referenceNumber: text("reference_number").notNull(),
    status: text("status").notNull(),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    organizationIndex: index("deliveries_organization_idx").on(table.organizationId),
    projectIndex: index("deliveries_project_idx").on(table.projectId),
    productionIndex: index("deliveries_production_idx").on(table.productionId),
    reviewIndex: index("deliveries_review_idx").on(table.reviewId),
    packageIndex: index("deliveries_package_idx").on(table.packageId),
    statusIndex: index("deliveries_status_idx").on(table.status),
    referenceUnique: uniqueIndex("deliveries_reference_unique").on(table.referenceNumber),
  }),
);

export const deliverySchema = { deliveries };
