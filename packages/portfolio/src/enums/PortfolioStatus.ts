export const PortfolioStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  ARCHIVED: "ARCHIVED",
} as const;

export type PortfolioStatus =
  (typeof PortfolioStatus)[keyof typeof PortfolioStatus];

export const PORTFOLIO_TRANSITIONS: Readonly<
  Record<PortfolioStatus, readonly PortfolioStatus[]>
> = {
  [PortfolioStatus.DRAFT]: [
    PortfolioStatus.ACTIVE,
    PortfolioStatus.CANCELLED,
    PortfolioStatus.ARCHIVED,
  ],
  [PortfolioStatus.ACTIVE]: [
    PortfolioStatus.ON_HOLD,
    PortfolioStatus.COMPLETED,
    PortfolioStatus.CANCELLED,
    PortfolioStatus.ARCHIVED,
  ],
  [PortfolioStatus.ON_HOLD]: [
    PortfolioStatus.ACTIVE,
    PortfolioStatus.CANCELLED,
    PortfolioStatus.ARCHIVED,
  ],
  [PortfolioStatus.COMPLETED]: [PortfolioStatus.ARCHIVED],
  [PortfolioStatus.CANCELLED]: [PortfolioStatus.ARCHIVED],
  [PortfolioStatus.ARCHIVED]: [],
};

export function canTransitionPortfolio(
  from: PortfolioStatus,
  to: PortfolioStatus,
): boolean {
  if (from === to) return true;
  return PORTFOLIO_TRANSITIONS[from].includes(to);
}
