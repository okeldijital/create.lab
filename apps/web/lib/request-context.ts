import {
  asActorId,
  type ApplicationContext,
  type ApplicationContextProvider,
} from "@creative-lab/application";
import { asOrganizationId } from "@creative-lab/organization";
import { getAuthenticatedApplicationContext } from "./auth/session";

export class MissingRequestContextError extends Error {
  constructor() {
    super("Authenticated organization and actor context is required.");
    this.name = "MissingRequestContextError";
  }
}

type TrustedRequestContext = {
  organizationId: string | null;
  actorId: string | null;
  correlationId?: string | null;
};

/**
 * Converts trusted upstream identity metadata into the application context.
 * This helper remains useful for tests and explicitly trusted adapters; the
 * production request provider below does not trust identity headers.
 */
export function toApplicationContext(
  input: TrustedRequestContext,
): ApplicationContext {
  if (!input.organizationId || !input.actorId) {
    throw new MissingRequestContextError();
  }

  return {
    organizationId: asOrganizationId(input.organizationId),
    actorId: asActorId(input.actorId),
    correlationId: input.correlationId ?? undefined,
  };
}

/** Next.js adapter for the provider-agnostic application context port. */
export const requestContextProvider: ApplicationContextProvider = {
  async getContext(): Promise<ApplicationContext> {
    return getAuthenticatedApplicationContext();
  },
};

export async function getApplicationContext(): Promise<ApplicationContext> {
  return requestContextProvider.getContext();
}
