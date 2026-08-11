import type { AssetId } from "@creative-lab/assets";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { Review } from "../aggregates/Review/Review.js";
import type { ReviewStatus } from "../enums/ReviewStatus.js";
import type { ReviewId } from "../types/ids.js";

export interface ReviewRepository {
  findById(id: ReviewId): Promise<Review | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Review[]>;
  findByProject(projectId: ProjectId): Promise<Review[]>;
  findByProduction(productionId: ProductionId): Promise<Review[]>;
  findByAsset(assetId: AssetId): Promise<Review[]>;
  findByStatus(status: ReviewStatus): Promise<Review[]>;
  save(review: Review): Promise<void>;
  update(review: Review): Promise<void>;
  archive(id: ReviewId): Promise<void>;
  exists(id: ReviewId): Promise<boolean>;
}
