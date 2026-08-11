import type { Portfolio } from "../aggregates/Portfolio/Portfolio.js";
import {
  PortfolioStatus,
  canTransitionPortfolio,
} from "../enums/PortfolioStatus.js";
import { InvalidPortfolioStateError } from "../errors/PortfolioErrors.js";

export class PortfolioLifecyclePolicy {
  static assertCanTransition(portfolio: Portfolio, to: PortfolioStatus): void {
    if (portfolio.isArchived) {
      throw new InvalidPortfolioStateError(
        "Archived portfolios are immutable.",
      );
    }
    if (!canTransitionPortfolio(portfolio.status, to)) {
      throw new InvalidPortfolioStateError(
        `Illegal portfolio transition: ${portfolio.status} → ${to}.`,
      );
    }
  }

  static assertStructurallyEditable(portfolio: Portfolio): void {
    if (portfolio.isArchived || portfolio.isCompleted) {
      throw new InvalidPortfolioStateError(
        "Cannot modify structure of completed or archived portfolios.",
      );
    }
    if (portfolio.status === PortfolioStatus.CANCELLED) {
      throw new InvalidPortfolioStateError(
        "Cannot modify structure of cancelled portfolios.",
      );
    }
  }

  static assertActive(portfolio: Portfolio): void {
    if (portfolio.status !== PortfolioStatus.ACTIVE) {
      throw new InvalidPortfolioStateError(
        `Portfolio must be ACTIVE (status: ${portfolio.status}).`,
      );
    }
  }
}
