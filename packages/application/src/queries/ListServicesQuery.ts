import type { Query } from "./Query.js";

export type ListServicesQuery = Query<"ListServices">;

export function listServicesQuery(): ListServicesQuery {
  return { type: "ListServices" };
}
