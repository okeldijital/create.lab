declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type EngagementId = Brand<string, "EngagementId">;
export type DeliverableId = Brand<string, "DeliverableId">;
export type MilestoneId = Brand<string, "MilestoneId">;
export type ObligationId = Brand<string, "ObligationId">;

export function asEngagementId(value: string): EngagementId {
  return value as EngagementId;
}
export function asDeliverableId(value: string): DeliverableId {
  return value as DeliverableId;
}
export function asMilestoneId(value: string): MilestoneId {
  return value as MilestoneId;
}
export function asObligationId(value: string): ObligationId {
  return value as ObligationId;
}
