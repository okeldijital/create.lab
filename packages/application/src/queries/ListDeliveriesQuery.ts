import type { Query } from "./Query.js";

export type ListDeliveriesQuery = Query<"ListDeliveries"> & {
  readonly projectId?: string;
};

export function listDeliveriesQuery(projectId?: string): ListDeliveriesQuery {
  return { type: "ListDeliveries", projectId };
}
