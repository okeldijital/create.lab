declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type ProjectId = Brand<string, "ProjectId">;
export type ProjectPhaseId = Brand<string, "ProjectPhaseId">;
export type DeliverableId = Brand<string, "DeliverableId">;
export type ProjectDependencyId = Brand<string, "ProjectDependencyId">;
export type ProjectObjectiveId = Brand<string, "ProjectObjectiveId">;

export function asProjectId(value: string): ProjectId {
  return value as ProjectId;
}
export function asProjectPhaseId(value: string): ProjectPhaseId {
  return value as ProjectPhaseId;
}
export function asDeliverableId(value: string): DeliverableId {
  return value as DeliverableId;
}
export function asProjectDependencyId(value: string): ProjectDependencyId {
  return value as ProjectDependencyId;
}
export function asProjectObjectiveId(value: string): ProjectObjectiveId {
  return value as ProjectObjectiveId;
}
