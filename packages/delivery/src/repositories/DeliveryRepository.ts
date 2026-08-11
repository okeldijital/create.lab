import type { OrganizationId } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { ReviewId } from "@creative-lab/review";
import type { Delivery } from "../aggregates/Delivery/Delivery.js";
import type { DeliveryStatus } from "../enums/DeliveryStatus.js";
import type { DeliveryId } from "../types/ids.js";

export interface DeliveryRepository {
  findById(id: DeliveryId): Promise<Delivery | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Delivery[]>;
  findByProject(projectId: ProjectId): Promise<Delivery[]>;
  findByProduction(productionId: ProductionId): Promise<Delivery[]>;
  findByReview(reviewId: ReviewId): Promise<Delivery[]>;
  findByReference(referenceNumber: string): Promise<Delivery | null>;
  findByStatus(status: DeliveryStatus): Promise<Delivery[]>;
  save(delivery: Delivery): Promise<void>;
  update(delivery: Delivery): Promise<void>;
  archive(id: DeliveryId): Promise<void>;
  exists(id: DeliveryId): Promise<boolean>;
}
