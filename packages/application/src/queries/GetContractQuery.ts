import type { Query } from "./Query.js";

export type GetContractQuery = Query<"GetContract"> & {
  readonly contractId: string;
};

export function getContractQuery(contractId: string): GetContractQuery {
  return { type: "GetContract", contractId };
}
