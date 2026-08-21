import {
  asActorId,
  type ApplicationContext,
  type ApplicationContextProvider,
} from "@creative-lab/application";
import { asOrganizationId } from "@creative-lab/organization";
import { headers } from "next/headers";

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
 * This adapter intentionally knows nothing about a specific identity vendor.
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
    const requestHeaders = await headers();
    return toApplicationContext({
      organizationId: requestHeaders.get("x-creative-lab-organization-id"),
      actorId: requestHeaders.get("x-creative-lab-actor-id"),
      correlationId: requestHeaders.get("x-correlation-id"),
    });
  },
};

export async function getApplicationContext(): Promise<ApplicationContext> {
  return requestContextProvider.getContext();
}
