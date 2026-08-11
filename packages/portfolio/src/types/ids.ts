declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type PortfolioId = Brand<string, "PortfolioId">;
export type ProgramId = Brand<string, "ProgramId">;
export type InitiativeId = Brand<string, "InitiativeId">;
export type PortfolioMilestoneId = Brand<string, "PortfolioMilestoneId">;

export function asPortfolioId(value: string): PortfolioId {
  return value as PortfolioId;
}
export function asProgramId(value: string): ProgramId {
  return value as ProgramId;
}
export function asInitiativeId(value: string): InitiativeId {
  return value as InitiativeId;
}
export function asPortfolioMilestoneId(value: string): PortfolioMilestoneId {
  return value as PortfolioMilestoneId;
}
