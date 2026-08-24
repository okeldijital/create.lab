import { asOrganizationId } from "@creative-lab/organization";
import type { OrganizationMembershipRepository, OrganizationMembership, MembershipRole } from "@creative-lab/organization";
import { and, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../PostgresDatabase.js";
import { organizationMemberships } from "./schema.js";

const roles = new Set<MembershipRole>(["owner", "admin", "member"]);

export class PostgresOrganizationMembershipRepository implements OrganizationMembershipRepository {
  public constructor(private readonly db: DrizzleDatabase) {}

  async findByActorAndOrganization(actorId: string, organizationId: string): Promise<OrganizationMembership | null> {
    const rows = await this.db
      .select()
      .from(organizationMemberships)
      .where(and(eq(organizationMemberships.actorId, actorId), eq(organizationMemberships.organizationId, organizationId)))
      .limit(1);

    const row = rows[0];
    if (!row || !roles.has(row.role as MembershipRole)) return null;

    return {
      actorId: row.actorId,
      organizationId: asOrganizationId(row.organizationId),
      role: row.role as MembershipRole,
      active: row.active === 1,
    };
  }
}
