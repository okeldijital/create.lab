declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type ProductionId = Brand<string, "ProductionId">;
export type ProductionSessionId = Brand<string, "ProductionSessionId">;
export type ProductionMilestoneId = Brand<string, "ProductionMilestoneId">;
export type RevisionId = Brand<string, "RevisionId">;

export function asProductionId(value: string): ProductionId {
  return value as ProductionId;
}
export function asProductionSessionId(value: string): ProductionSessionId {
  return value as ProductionSessionId;
}
export function asProductionMilestoneId(value: string): ProductionMilestoneId {
  return value as ProductionMilestoneId;
}
export function asRevisionId(value: string): RevisionId {
  return value as RevisionId;
}
