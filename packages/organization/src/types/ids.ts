/**
 * Branded identity types for the Organization bounded context.
 * Prevent accidental mixing of entity IDs at compile time.
 */

declare const __brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type OrganizationId = Brand<string, "OrganizationId">;
export type DepartmentId = Brand<string, "DepartmentId">;
export type TeamId = Brand<string, "TeamId">;
export type StudioId = Brand<string, "StudioId">;
export type EventId = Brand<string, "EventId">;

export function asOrganizationId(value: string): OrganizationId {
  return value as OrganizationId;
}

export function asDepartmentId(value: string): DepartmentId {
  return value as DepartmentId;
}

export function asTeamId(value: string): TeamId {
  return value as TeamId;
}

export function asStudioId(value: string): StudioId {
  return value as StudioId;
}

export function asEventId(value: string): EventId {
  return value as EventId;
}
