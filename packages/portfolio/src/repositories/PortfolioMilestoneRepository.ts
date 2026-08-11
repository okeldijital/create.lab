import type { PortfolioMilestone } from "../aggregates/PortfolioMilestone/PortfolioMilestone.js";
import type { PortfolioId, PortfolioMilestoneId } from "../types/ids.js";

export interface PortfolioMilestoneRepository {
  findById(id: PortfolioMilestoneId): Promise<PortfolioMilestone | null>;
  findByPortfolio(portfolioId: PortfolioId): Promise<PortfolioMilestone[]>;
  save(milestone: PortfolioMilestone): Promise<void>;
  update(milestone: PortfolioMilestone): Promise<void>;
  exists(id: PortfolioMilestoneId): Promise<boolean>;
}
