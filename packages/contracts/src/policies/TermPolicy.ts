import type { ContractTerm } from "../aggregates/ContractTerm/ContractTerm.js";
import {
  ContractTermError,
  MandatoryTermRemovalError,
} from "../errors/ContractErrors.js";

export class TermPolicy {
  static assertUniqueOrder(
    order: number,
    existing: readonly ContractTerm[],
    excludeTermId?: string,
  ): void {
    const dup = existing.find(
      (t) => t.order === order && t.id !== excludeTermId,
    );
    if (dup) {
      throw new ContractTermError(
        `Term order ${order} is already used on this version.`,
      );
    }
  }

  static assertCanRemove(term: ContractTerm): void {
    if (term.mandatory) {
      throw new MandatoryTermRemovalError(term.id);
    }
  }

  static assertHasMandatoryWhenActivating(
    terms: readonly ContractTerm[],
  ): void {
    // Optional: require at least one term overall.
    if (terms.length === 0) {
      throw new ContractTermError(
        "Cannot activate a contract version without terms.",
      );
    }
  }

  static nextOrder(existing: readonly ContractTerm[]): number {
    return existing.reduce((m, t) => Math.max(m, t.order), 0) + 1;
  }
}
