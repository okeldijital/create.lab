import type { ProductionMilestone } from "../aggregates/ProductionMilestone/ProductionMilestone.js";
import type { ProductionId, ProductionMilestoneId } from "../types/ids.js";

export interface MilestoneRepository {
  findById(id: ProductionMilestoneId): Promise<ProductionMilestone | null>;
  findByProduction(
    productionId: ProductionId,
  ): Promise<ProductionMilestone[]>;
  save(milestone: ProductionMilestone): Promise<void>;
  update(milestone: ProductionMilestone): Promise<void>;
}
