import type { Query } from "./Query.js";

export type ListServiceCategoriesQuery = Query<"ListServiceCategories">;

export function listServiceCategoriesQuery(): ListServiceCategoriesQuery {
  return { type: "ListServiceCategories" };
}
