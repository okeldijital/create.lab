import { asActorId, type ApplicationContext } from "@creative-lab/application";
import { asOrganizationId } from "@creative-lab/organization";
import { headers } from "next/headers";

export class MissingRequestContextError extends Error {
  constructor() {
    super("Authenticated organization and actor context is required.");
    this.name = "MissingRequestContextError";
  }
}

/** Translates trusted upstream identity metadata into ApplicationContext. */
export async function getApplicationContext(): Promise<ApplicationContext> {
  const requestHeaders = await headers();
  const organizationId = requestHeaders.get("x-creative-lab-organization-id");
  const actorId = requestHeaders.get("x-creative-lab-actor-id");

  if (!organizationId || !actorId) throw new MissingRequestContextError();

  return {
    organizationId: asOrganizationId(organizationId),
    actorId: asActorId(actorId),
    correlationId: requestHeaders.get("x-correlation-id") ?? undefined,
  };
}
