import type { Query } from "./Query.js";

export type ListCustomersQuery = Query<"ListCustomers">;

export function listCustomersQuery(): ListCustomersQuery {
  return { type: "ListCustomers" };
}
