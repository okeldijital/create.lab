import type { Query } from "./Query.js";

export type ListQuotesQuery = Query<"ListQuotes"> & {
  readonly customerId?: string;
  readonly status?: string;
};

export function listQuotesQuery(
  input: Omit<ListQuotesQuery, "type"> = {},
): ListQuotesQuery {
  return { type: "ListQuotes", ...input };
}
