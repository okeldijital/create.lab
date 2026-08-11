import type { Initiative } from "../aggregates/Initiative/Initiative.js";
import {
  DuplicateInitiativeTitleError,
  InvalidPortfolioStateError,
} from "../errors/PortfolioErrors.js";

export class InitiativePolicy {
  static assertUniqueTitle(
    portfolioId: string,
    title: string,
    existing: readonly Initiative[],
    excludeId?: string,
  ): void {
    const normalized = title.trim().toLowerCase();
    const dup = existing.find(
      (i) =>
        i.title.value.toLowerCase() === normalized && i.id !== excludeId,
    );
    if (dup) {
      throw new DuplicateInitiativeTitleError(title.trim(), portfolioId);
    }
  }

  static assertMutable(initiative: Initiative): void {
    if (initiative.isTerminal) {
      throw new InvalidPortfolioStateError(
        "Completed or cancelled initiatives are immutable.",
      );
    }
  }
}
