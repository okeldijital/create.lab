import type { Revision } from "../aggregates/Revision/Revision.js";
import {
  RevisionStatus,
  canTransitionRevision,
} from "../enums/RevisionStatus.js";
import {
  DuplicateRevisionError,
  RevisionLifecycleError,
} from "../errors/ProductionErrors.js";
import { RevisionNumber } from "../value-objects/RevisionNumber.js";

export class RevisionPolicy {
  static nextNumber(existing: readonly Revision[]): RevisionNumber {
    if (existing.length === 0) return RevisionNumber.first();
    const max = Math.max(...existing.map((r) => r.revisionNumber.value));
    return RevisionNumber.create(max + 1);
  }

  static assertSequential(
    existing: readonly Revision[],
    revisionNumber: number,
  ): void {
    const expected = RevisionPolicy.nextNumber(existing).value;
    if (revisionNumber !== expected) {
      throw new DuplicateRevisionError(
        `Revision number must be sequential: expected ${expected}, received ${revisionNumber}.`,
      );
    }
  }

  static assertCanTransition(revision: Revision, to: RevisionStatus): void {
    if (revision.status === RevisionStatus.CLOSED) {
      throw new RevisionLifecycleError("Closed revisions are immutable.");
    }
    if (!canTransitionRevision(revision.status, to)) {
      throw new RevisionLifecycleError(
        `Illegal revision transition: ${revision.status} → ${to}.`,
      );
    }
  }
}
