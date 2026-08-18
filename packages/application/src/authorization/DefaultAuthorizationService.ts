import type { OrganizationMembership, MembershipRole } from "@creative-lab/organization";
import { AuthorizationError } from "../errors/ApplicationErrors.js";
import type { ApplicationContext } from "../types/context.js";
import type { Permission } from "../types/ids.js";
import type { AuthorizationService } from "./AuthorizationService.js";

export interface MembershipReader {
  findMembership(actorId: string, organizationId: string): Promise<OrganizationMembership | null>;
}

const ROLE_PERMISSIONS: Record<MembershipRole, ReadonlySet<Permission>> = {
  owner: new Set([
    "organization.create", "organization.archive", "organization.read",
    "project.create", "project.read", "project.archive",
    "production.start", "production.read", "asset.create", "asset.read", "asset.archive",
    "review.approve", "review.read", "delivery.create", "delivery.read",
    "invoice.create", "invoice.read", "invoice.approve", "quote.create", "quote.read", "quote.issue",
    "contract.activate", "contract.read", "engagement.create", "engagement.read",
    "portfolio.create", "portfolio.read", "knowledge.create", "knowledge.read", "knowledge.search",
  ]),
  admin: new Set([
    "organization.read", "project.create", "project.read", "project.archive",
    "production.start", "production.read", "asset.create", "asset.read", "asset.archive",
    "review.approve", "review.read", "delivery.create", "delivery.read",
    "invoice.create", "invoice.read", "invoice.approve", "quote.create", "quote.read", "quote.issue",
    "contract.activate", "contract.read", "engagement.create", "engagement.read",
    "portfolio.create", "portfolio.read", "knowledge.create", "knowledge.read", "knowledge.search",
  ]),
  member: new Set([
    "organization.read", "project.read", "production.read", "asset.create", "asset.read",
    "review.read", "delivery.read", "invoice.read", "quote.read", "contract.read",
    "engagement.read", "portfolio.read", "knowledge.create", "knowledge.read", "knowledge.search",
  ]),
};

export class DefaultAuthorizationService implements AuthorizationService {
  constructor(private readonly memberships: MembershipReader) {}

  async can(permission: Permission, context: ApplicationContext): Promise<boolean> {
    if (!context?.organizationId || !context?.actorId) return false;
    const membership = await this.memberships.findMembership(String(context.actorId), String(context.organizationId));
    if (!membership || !membership.active || String(membership.organizationId) !== String(context.organizationId)) return false;
    return ROLE_PERMISSIONS[membership.role].has(permission);
  }

  async assertCan(permission: Permission, context: ApplicationContext): Promise<void> {
    if (!(await this.can(permission, context))) {
      throw new AuthorizationError();
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
