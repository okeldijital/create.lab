declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type AllocationId = Brand<string, "AllocationId">;
export type AllocationGroupId = Brand<string, "AllocationGroupId">;
export type ReservationId = Brand<string, "ReservationId">;

export function asAllocationId(value: string): AllocationId {
  return value as AllocationId;
}
export function asAllocationGroupId(value: string): AllocationGroupId {
  return value as AllocationGroupId;
}
export function asReservationId(value: string): ReservationId {
  return value as ReservationId;
}

/** @deprecated Prefer AllocationId — retained alias for migration from EPIC-205. */
export type ResourceAllocationId = AllocationId;
/** @deprecated Prefer asAllocationId */
export const asResourceAllocationId = asAllocationId;
