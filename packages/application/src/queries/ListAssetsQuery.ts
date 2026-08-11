import type { Query } from "./Query.js";

export type ListAssetsQuery = Query<"ListAssets"> & {
  readonly projectId?: string;
  readonly status?: string;
};

export function listAssetsQuery(
  input: Omit<ListAssetsQuery, "type"> = {},
): ListAssetsQuery {
  return { type: "ListAssets", ...input };
}
