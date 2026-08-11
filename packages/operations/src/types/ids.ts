declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type WorkOrderId = Brand<string, "WorkOrderId">;
export type WorkSessionId = Brand<string, "WorkSessionId">;
export type WorkMilestoneId = Brand<string, "WorkMilestoneId">;
export type WorkOutputId = Brand<string, "WorkOutputId">;
export type WorkIncidentId = Brand<string, "WorkIncidentId">;
/** Opaque reference to an Allocation commitment (Allocation owns the aggregate). */
export type AllocationId = Brand<string, "AllocationId">;

export function asWorkOrderId(value: string): WorkOrderId {
  return value as WorkOrderId;
}
export function asAllocationId(value: string): AllocationId {
  return value as AllocationId;
}
export function asWorkSessionId(value: string): WorkSessionId {
  return value as WorkSessionId;
}
export function asWorkMilestoneId(value: string): WorkMilestoneId {
  return value as WorkMilestoneId;
}
export function asWorkOutputId(value: string): WorkOutputId {
  return value as WorkOutputId;
}
export function asWorkIncidentId(value: string): WorkIncidentId {
  return value as WorkIncidentId;
}
