import {
  Delivery,
  asDeliveryId,
  asDeliveryPackageId,
  type DeliverySnapshot,
} from "@creative-lab/delivery";
import type { InferSelectModel } from "drizzle-orm";
import type { deliveries } from "./schema.js";

type DeliveryRow = InferSelectModel<typeof deliveries>;

export const DeliveryMapper = {
  toRow(delivery: Delivery): DeliveryRow {
    const s = delivery.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      projectId: s.projectId,
      productionId: s.productionId,
      reviewId: s.reviewId,
      packageId: s.packageId,
      referenceNumber: s.referenceNumber,
      status: s.status,
      deliveredAt: s.deliveredAt,
      completedAt: s.completedAt,
      archivedAt: s.archivedAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },

  fromRow(row: DeliveryRow): Delivery {
    const snapshot: DeliverySnapshot = {
      id: asDeliveryId(row.id),
      organizationId: row.organizationId as DeliverySnapshot["organizationId"],
      projectId: row.projectId as DeliverySnapshot["projectId"],
      productionId: row.productionId as DeliverySnapshot["productionId"],
      reviewId: row.reviewId as DeliverySnapshot["reviewId"],
      packageId: row.packageId ? asDeliveryPackageId(row.packageId) : null,
      referenceNumber: row.referenceNumber,
      status: row.status as DeliverySnapshot["status"],
      deliveredAt: row.deliveredAt ? new Date(row.deliveredAt) : null,
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Delivery.reconstitute(snapshot);
  },
};
