import type { ApplicationContext } from "../types/context.js";
import type { Permission } from "../types/ids.js";

/**
 * Authorization boundary port.
 * No RBAC implementation in BUILD-001 — interface only (+ test doubles).
 */
export interface AuthorizationService {
  can(
    permission: Permission,
    context: ApplicationContext,
  ): Promise<boolean>;

  assertCan(
    permission: Permission,
    context: ApplicationContext,
  ): Promise<void>;

  canCreateProject(context: ApplicationContext): Promise<boolean>;
  canApproveInvoice(context: ApplicationContext): Promise<boolean>;
  canArchiveAsset(context: ApplicationContext): Promise<boolean>;
  canCreateOrganization(context: ApplicationContext): Promise<boolean>;
  canApproveReview(context: ApplicationContext): Promise<boolean>;
  canIssueQuote(context: ApplicationContext): Promise<boolean>;
  canActivateContract(context: ApplicationContext): Promise<boolean>;
}
