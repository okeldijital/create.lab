import type { ApplicationContext } from "@creative-lab/application";
import { asActorId } from "@creative-lab/application";
import { asOrganizationId } from "@creative-lab/organization";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { getBetterAuth, getBetterAuthRuntime } from "./better-auth";

export class MissingAuthenticatedContextError extends Error {
  constructor() {
    super("Authenticated organization and actor context is required.");
    this.name = "MissingAuthenticatedContextError";
  }
}

async function organizationForActor(actorId: string, name: string) {
  const client = getBetterAuthRuntime().database.client;
  const existing = await client<{ organization_id: string }[]>`
    select organization_id
    from organization_memberships
    where actor_id = ${actorId} and active = 1
    order by created_at asc
    limit 1
  `;
  if (existing[0]?.organization_id) return existing[0].organization_id;

  const organizationId = randomUUID();
  const slug = `workspace-${actorId.slice(0, 12).toLowerCase()}`;
  const label = name.trim() || "Personal workspace";
  await client`
    insert into organizations (
      id, name, display_name, legal_name, slug, timezone, locale, currency, status, branding, created_at, updated_at
    ) values (
      ${organizationId}, ${label}, ${label}, ${label}, ${slug}, 'Africa/Johannesburg', 'en-ZA', 'ZAR', 'active', '{}'::jsonb, now(), now()
    )
  `;
  await client`
    insert into organization_memberships (
      actor_id, organization_id, role, active, created_at, updated_at
    ) values (
      ${actorId}, ${organizationId}, 'owner', 1, now(), now()
    )
  `;
  return organizationId;
}

export async function getAuthenticatedApplicationContext(): Promise<ApplicationContext> {
  const requestHeaders = await headers();
  const session = await getBetterAuth().api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) throw new MissingAuthenticatedContextError();

  const organizationId = await organizationForActor(session.user.id, session.user.name ?? "");
  return {
    organizationId: asOrganizationId(organizationId),
    actorId: asActorId(session.user.id),
    correlationId: requestHeaders.get("x-correlation-id") ?? undefined,
  };
}

export async function getOptionalSession() {
  const requestHeaders = await headers();
  const session = await getBetterAuth().api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) return null;
  return { id: session.user.id, name: session.user.name || session.user.email };
}
