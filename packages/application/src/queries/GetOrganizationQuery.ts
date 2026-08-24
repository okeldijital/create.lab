import type { OrganizationId } from "@creative-lab/organization";
import type { Query } from "./Query.js";

export type GetOrganizationQuery = Query<"GetOrganization"> & {
  readonly organizationId: OrganizationId;
};

export function getOrganizationQuery(
  organizationId: OrganizationId,
): GetOrganizationQuery {
  return { type: "GetOrganization", organizationId };
}
