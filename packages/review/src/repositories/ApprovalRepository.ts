import type { OrganizationId } from "@creative-lab/organization";
import type { Approval } from "../aggregates/Approval/Approval.js";
import type { ApprovalId, ReviewId } from "../types/ids.js";

export interface ApprovalRepository {
  findById(id: ApprovalId): Promise<Approval | null>;
  findByReview(reviewId: ReviewId): Promise<Approval[]>;
  findByOrganization(organizationId: OrganizationId): Promise<Approval[]>;
  save(approval: Approval): Promise<void>;
  update(approval: Approval): Promise<void>;
  exists(id: ApprovalId): Promise<boolean>;
}
