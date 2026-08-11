/**
 * Branded identity types for the Workforce bounded context.
 */

declare const __brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type WorkerId = Brand<string, "WorkerId">;
export type PositionId = Brand<string, "PositionId">;
export type EmploymentId = Brand<string, "EmploymentId">;
export type EmploymentContractId = Brand<string, "EmploymentContractId">;
export type ReportingRelationshipId = Brand<string, "ReportingRelationshipId">;
export type EventId = Brand<string, "EventId">;

export function asWorkerId(value: string): WorkerId {
  return value as WorkerId;
}
export function asPositionId(value: string): PositionId {
  return value as PositionId;
}
export function asEmploymentId(value: string): EmploymentId {
  return value as EmploymentId;
}
export function asEmploymentContractId(value: string): EmploymentContractId {
  return value as EmploymentContractId;
}
export function asReportingRelationshipId(
  value: string,
): ReportingRelationshipId {
  return value as ReportingRelationshipId;
}
export function asEventId(value: string): EventId {
  return value as EventId;
}
