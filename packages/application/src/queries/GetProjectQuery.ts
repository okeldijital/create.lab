import type { Query } from "./Query.js";

export type GetProjectQuery = Query<"GetProject"> & {
  readonly projectId: string;
};

export function getProjectQuery(projectId: string): GetProjectQuery {
  return { type: "GetProject", projectId };
}
