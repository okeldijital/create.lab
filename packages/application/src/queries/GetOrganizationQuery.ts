import type { Query } from "./Query.js";

export type GetOrganizationQuery = Query<"GetOrganization"> & {
  readonly organizationId: string;
};

export function getOrganizationQuery(
  organizationId: string,
): GetOrganizationQuery {
  return { type: "GetOrganization", organizationId };
}
