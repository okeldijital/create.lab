import type { OrganizationId } from "@creative-lab/organization";
import type { Portfolio } from "../aggregates/Portfolio/Portfolio.js";
import type { PortfolioStatus } from "../enums/PortfolioStatus.js";
import type { PortfolioId } from "../types/ids.js";

export interface PortfolioRepository {
  findById(id: PortfolioId): Promise<Portfolio | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Portfolio[]>;
  findByStatus(status: PortfolioStatus): Promise<Portfolio[]>;
  findByPortfolioNumber(
    organizationId: OrganizationId,
    portfolioNumber: string,
  ): Promise<Portfolio | null>;
  save(portfolio: Portfolio): Promise<void>;
  update(portfolio: Portfolio): Promise<void>;
  archive(id: PortfolioId): Promise<void>;
  exists(id: PortfolioId): Promise<boolean>;
}
