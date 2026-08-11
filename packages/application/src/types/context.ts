import type { OrganizationId } from "@creative-lab/organization";
import type { ActorId } from "./ids.js";

/**
 * Runtime execution context for a use case.
 * Carries tenancy and actor identity — not business rules.
 */
export type ApplicationContext = {
  readonly organizationId: OrganizationId;
  readonly actorId: ActorId;
  readonly correlationId?: string;
  readonly now?: Date;
  readonly metadata?: Readonly<Record<string, string>>;
};
