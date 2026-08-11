import type { Query } from "./Query.js";

export type SearchKnowledgeQuery = Query<"SearchKnowledge"> & {
  readonly categoryId?: string;
  readonly status?: string;
  readonly titleContains?: string;
};

export function searchKnowledgeQuery(
  input: Omit<SearchKnowledgeQuery, "type"> = {},
): SearchKnowledgeQuery {
  return { type: "SearchKnowledge", ...input };
}
