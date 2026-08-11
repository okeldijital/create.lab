import type { Milestone } from "../aggregates/Milestone/Milestone.js";
import type { EngagementId, MilestoneId } from "../types/ids.js";

export interface MilestoneRepository {
  findById(id: MilestoneId): Promise<Milestone | null>;
  findByEngagement(engagementId: EngagementId): Promise<Milestone[]>;
  save(milestone: Milestone): Promise<void>;
  update(milestone: Milestone): Promise<void>;
  exists(id: MilestoneId): Promise<boolean>;
}
