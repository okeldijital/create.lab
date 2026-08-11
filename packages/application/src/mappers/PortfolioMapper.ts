import type { Portfolio } from "@creative-lab/portfolio";
import type { PortfolioDto } from "../dto/common.js";

export class PortfolioMapper {
  static toDto(portfolio: Portfolio): PortfolioDto {
    return {
      id: portfolio.id,
      organizationId: portfolio.organizationId,
      portfolioNumber: portfolio.portfolioNumber.value,
      name: portfolio.name.value,
      status: portfolio.status,
      startDate: portfolio.startDate.toISOString(),
    };
  }
}
