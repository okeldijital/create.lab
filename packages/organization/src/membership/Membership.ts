import type { OrganizationId } from "../types/index.js";

export type MembershipRole = "owner" | "admin" | "member";

export type OrganizationMembership = {
  readonly actorId: string;
  readonly organizationId: OrganizationId;
  readonly role: MembershipRole;
  readonly active: boolean;
};
