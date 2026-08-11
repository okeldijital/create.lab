import type { AuthorizationService, ApplicationContext, Permission } from "@creative-lab/application";
import { AuthorizationAdapterError } from "../errors/InfrastructureErrors.js";

type Membership = {
  readonly organizationId: string;
  readonly actorId: string;
  readonly role: string;
  readonly permissions: ReadonlySet<Permission>;
};

export class InMemoryAuthorizationService implements AuthorizationService {
  private readonly memberships = new Map<string, Membership>();

  grantMembership(
    organizationId: string,
    actorId: string,
    role: string,
    permissions: Iterable<Permission>,
  ): void {
    if (!organizationId || !actorId || !role) {
      throw new AuthorizationAdapterError("Membership requires organization, actor, and role");
    }
    this.memberships.set(`${organizationId}:${actorId}`, {
      organizationId,
      actorId,
      role,
      permissions: new Set(permissions),
    });
  }

  revokeMembership(organizationId: string, actorId: string): void {
    this.memberships.delete(`${organizationId}:${actorId}`);
  }

  async can(permission: Permission, context: ApplicationContext): Promise<boolean> {
    if (!context?.organizationId || !context?.actorId) return false;
    const membership = this.memberships.get(`${context.organizationId}:${context.actorId}`);
    if (!membership || membership.organizationId !== context.organizationId) return false;
    return membership.permissions.has(permission);
  }

  async assertCan(permission: Permission, context: ApplicationContext): Promise<void> {
    if (!(await this.can(permission, context))) {
      throw new AuthorizationAdapterError(`Authorization denied for ${permission}`);
    }
  }

  canCreateProject(context: ApplicationContext) { return this.can("project.create", context); }
  canApproveInvoice(context: ApplicationContext) { return this.can("invoice.approve", context); }
  canArchiveAsset(context: ApplicationContext) { return this.can("asset.archive", context); }
  canCreateOrganization(context: ApplicationContext) { return this.can("organization.create", context); }
  canApproveReview(context: ApplicationContext) { return this.can("review.approve", context); }
  canIssueQuote(context: ApplicationContext) { return this.can("quote.issue", context); }
  canActivateContract(context: ApplicationContext) { return this.can("contract.activate", context); }
}
