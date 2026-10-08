import type { ApplicationContext, ActorId } from "@creative-lab/application";
import { asActorId } from "@creative-lab/application";
import { asOrganizationId } from "@creative-lab/organization";
import type { MembershipReader } from "@creative-lab/application";
import type { BetterAuthSessionUser } from "./BetterAuthIdentity.js";

/**
 * Minimal provider-neutral session shape required by the runtime boundary.
 * Provider-specific Better Auth session objects must be reduced to this shape
 * before entering application authorization.
 */
export interface BetterAuthRuntimeSession {
  user: BetterAuthSessionUser;
  organizationId?: string | null;
}

export interface CurrentIdentity {
  actorId: ActorId;
  organizationId: ReturnType<typeof asOrganizationId>;
}

/**
 * Resolves an authenticated provider identity into an application context.
 * Membership is always verified against the resolved actor and organization;
 * an absent session, organization, or active membership fails closed.
 */
export class CurrentIdentityService {
  public constructor(private readonly memberships: MembershipReader) {}

  public async resolveFromBetterAuthSession(
    session: BetterAuthRuntimeSession | null | undefined,
  ): Promise<ApplicationContext | null> {
    if (!session?.user?.id || !session.organizationId) return null;

    const actorId = asActorId(session.user.id);
    const organizationId = asOrganizationId(session.organizationId);
    const membership = await this.memberships.findMembership(String(actorId), String(organizationId));

    if (!membership || !membership.active) return null;
    if (String(membership.actorId) !== String(actorId)) return null;
    if (String(membership.organizationId) !== String(organizationId)) return null;

    return {
      actorId,
      organizationId,
    };
  }
}
