import type { Query } from "./Query.js";

export type ListContractsQuery = Query<"ListContracts"> & {
  readonly customerId?: string;
  readonly status?: string;
};

export function listContractsQuery(
  input: Omit<ListContractsQuery, "type"> = {},
): ListContractsQuery {
  return { type: "ListContracts", ...input };
}
