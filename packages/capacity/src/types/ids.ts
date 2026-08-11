declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type CapacityProfileId = Brand<string, "CapacityProfileId">;
export type CapabilityId = Brand<string, "CapabilityId">;
export type AvailabilityProfileId = Brand<string, "AvailabilityProfileId">;
export type WorkingPatternId = Brand<string, "WorkingPatternId">;
export type ResourceCapacityId = Brand<string, "ResourceCapacityId">;
/** Opaque resource identity (WorkerId, StudioId, or future resource IDs). */
export type ResourceId = Brand<string, "ResourceId">;

export function asCapacityProfileId(value: string): CapacityProfileId {
  return value as CapacityProfileId;
}
export function asCapabilityId(value: string): CapabilityId {
  return value as CapabilityId;
}
export function asAvailabilityProfileId(value: string): AvailabilityProfileId {
  return value as AvailabilityProfileId;
}
export function asWorkingPatternId(value: string): WorkingPatternId {
  return value as WorkingPatternId;
}
export function asResourceCapacityId(value: string): ResourceCapacityId {
  return value as ResourceCapacityId;
}
export function asResourceId(value: string): ResourceId {
  return value as ResourceId;
}
