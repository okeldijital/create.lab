import type { Initiative } from "../aggregates/Initiative/Initiative.js";
import type { InitiativeId, PortfolioId } from "../types/ids.js";

export interface InitiativeRepository {
  findById(id: InitiativeId): Promise<Initiative | null>;
  findByPortfolio(portfolioId: PortfolioId): Promise<Initiative[]>;
  save(initiative: Initiative): Promise<void>;
  update(initiative: Initiative): Promise<void>;
  exists(id: InitiativeId): Promise<boolean>;
}
