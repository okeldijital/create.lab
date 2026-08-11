import type { Production } from "../aggregates/Production/Production.js";
import {
  ProductionStatus,
  canTransitionProduction,
} from "../enums/ProductionStatus.js";
import {
  DuplicateProductionError,
  InvalidProductionStateError,
} from "../errors/ProductionErrors.js";
import type { OrganizationId } from "@creative-lab/organization";
import { ProductionName } from "../value-objects/ProductionName.js";

export class ProductionLifecyclePolicy {
  static assertCanTransition(
    production: Production,
    to: ProductionStatus,
  ): void {
    if (production.isArchived) {
      throw new InvalidProductionStateError(
        "Archived productions are immutable.",
      );
    }
    if (
      production.isCompleted &&
      to !== ProductionStatus.ARCHIVED
    ) {
      throw new InvalidProductionStateError(
        "Completed productions are immutable except archive.",
      );
    }
    if (!canTransitionProduction(production.status, to)) {
      throw new InvalidProductionStateError(
        `Illegal production transition: ${production.status} → ${to}.`,
      );
    }
  }

  static assertMutable(production: Production): void {
    if (production.isArchived) {
      throw new InvalidProductionStateError(
        "Archived productions are immutable.",
      );
    }
    if (production.isCompleted) {
      throw new InvalidProductionStateError(
        "Completed productions are immutable.",
      );
    }
  }

  static assertAcceptsChildActivity(production: Production): void {
    if (production.isArchived || production.isCompleted) {
      throw new InvalidProductionStateError(
        `Production in status ${production.status} cannot accept child activity.`,
      );
    }
  }

  static assertUniqueName(
    existing: readonly Production[],
    name: string,
    organizationId: OrganizationId,
    excludeId?: string,
  ): void {
    const candidate = ProductionName.create(name);
    const dup = existing.find(
      (p) =>
        p.id !== excludeId &&
        p.organizationId === organizationId &&
        !p.isArchived &&
        p.name.equalsIgnoreCase(candidate),
    );
    if (dup) {
      throw new DuplicateProductionError(
        `Production name "${candidate.value}" already exists in organization "${organizationId}".`,
      );
    }
  }
}
