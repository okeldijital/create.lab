import type { ActorId } from "@creative-lab/application";
import { asActorId } from "@creative-lab/application";

/** Minimal provider-neutral identity produced from an authenticated Better Auth session. */
export interface AuthenticatedIdentity {
  actorId: ActorId;
  organizationId: string;
}

export interface BetterAuthSessionUser {
  id: string;
}

/** Converts the provider user identifier into the application's opaque actor identity. */
export function toAuthenticatedIdentity(
  user: BetterAuthSessionUser,
  organizationId: string,
): AuthenticatedIdentity {
  if (!user.id) {
    throw new Error("Authenticated user is missing an id");
  }
  if (!organizationId) {
    throw new Error("Authenticated identity is missing an organizationId");
  }

  return {
    actorId: asActorId(user.id),
    organizationId,
  };
}
