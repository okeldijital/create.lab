import type { ApplicationContext } from "@creative-lab/application";
import { createBetterAuthApplicationContextProvider } from "@creative-lab/infrastructure";
import { headers } from "next/headers";
import { getBetterAuth, getBetterAuthMemberships } from "./better-auth";

export class MissingAuthenticatedContextError extends Error {
  constructor() {
    super("Authenticated organization and actor context is required.");
    this.name = "MissingAuthenticatedContextError";
  }
}

/**
 * Resolves the current Better Auth session into the provider-neutral
 * application context. The organization header is only a tenant selector;
 * membership is independently verified before an ApplicationContext exists.
 */
export async function getAuthenticatedApplicationContext(): Promise<ApplicationContext> {
  const requestHeaders = await headers();
  const session = await getBetterAuth().api.getSession({ headers: requestHeaders });
  const organizationId = requestHeaders.get("x-creative-lab-organization-id");

  if (!session?.user?.id || !organizationId) {
    throw new MissingAuthenticatedContextError();
  }

  const provider = createBetterAuthApplicationContextProvider(
    async () => ({
      user: { id: session.user.id },
      organizationId,
    }),
    {
      findMembership: (actorId, selectedOrganizationId) =>
        getBetterAuthMemberships().findByActorAndOrganization(
          actorId,
          selectedOrganizationId,
        ),
    },
  );

  const context = await provider.getContext();
  if (!context) {
    throw new MissingAuthenticatedContextError();
  }

  return context;
}
