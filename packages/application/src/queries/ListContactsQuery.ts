import type { Query } from "./Query.js";

export type ListContactsQuery = Query<"ListContacts"> & {
  readonly customerId: string;
};

export function listContactsQuery(customerId: string): ListContactsQuery {
  return { type: "ListContacts", customerId };
}
