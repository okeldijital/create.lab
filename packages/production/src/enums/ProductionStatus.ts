export const ProductionStatus = {
  CREATED: "CREATED",
  PLANNING: "PLANNING",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ProductionStatus =
  (typeof ProductionStatus)[keyof typeof ProductionStatus];

export const PRODUCTION_TRANSITIONS: Readonly<
  Record<ProductionStatus, readonly ProductionStatus[]>
> = {
  [ProductionStatus.CREATED]: [
    ProductionStatus.PLANNING,
    ProductionStatus.ACTIVE,
    ProductionStatus.ARCHIVED,
  ],
  [ProductionStatus.PLANNING]: [
    ProductionStatus.ACTIVE,
    ProductionStatus.ON_HOLD,
    ProductionStatus.ARCHIVED,
  ],
  [ProductionStatus.ACTIVE]: [
    ProductionStatus.ON_HOLD,
    ProductionStatus.COMPLETED,
    ProductionStatus.ARCHIVED,
  ],
  [ProductionStatus.ON_HOLD]: [
    ProductionStatus.ACTIVE,
    ProductionStatus.PLANNING,
    ProductionStatus.ARCHIVED,
  ],
  [ProductionStatus.COMPLETED]: [ProductionStatus.ARCHIVED],
  [ProductionStatus.ARCHIVED]: [],
};

export function canTransitionProduction(
  from: ProductionStatus,
  to: ProductionStatus,
): boolean {
  if (from === to) return true;
  return PRODUCTION_TRANSITIONS[from].includes(to);
}
