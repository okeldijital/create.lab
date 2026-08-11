import type { Query } from "./Query.js";

export type FindInvoicesQuery = Query<"FindInvoices"> & {
  readonly status?: string;
  readonly customerId?: string;
};

export function findInvoicesQuery(
  input: Omit<FindInvoicesQuery, "type"> = {},
): FindInvoicesQuery {
  return { type: "FindInvoices", ...input };
}
