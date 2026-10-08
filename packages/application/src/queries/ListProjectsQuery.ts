import type { Query } from "./Query.js";

export type ListProjectsQuery = Query<"ListProjects">;

export function listProjectsQuery(): ListProjectsQuery {
  return { type: "ListProjects" };
}
