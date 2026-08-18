import type { OrganizationMembership } from "../membership/Membership.js";

/** Persistence port for organization membership. Implementations live in infrastructure. */
export interface OrganizationMembershipRepository {
  findByActorAndOrganization(actorId: string, organizationId: string): Promise<OrganizationMembership | null>;
}
