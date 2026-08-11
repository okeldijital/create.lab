import type { ProjectPhase } from "../aggregates/ProjectPhase/ProjectPhase.js";
import { PhaseStatus } from "../enums/PhaseStatus.js";
import {
  DuplicatePhaseError,
  PhaseSequenceError,
} from "../errors/ProjectErrors.js";

/**
 * Phase sequencing: unique sequences, no gaps on create, single active phase.
 */
export class PhasePolicy {
  static assertUniqueSequence(
    existing: readonly ProjectPhase[],
    sequence: number,
    excludeId?: string,
  ): void {
    const dup = existing.find(
      (p) => p.id !== excludeId && p.sequence === sequence,
    );
    if (dup) {
      throw new DuplicatePhaseError(
        `Phase sequence ${sequence} already exists on this project.`,
      );
    }
  }

  /**
   * When adding sequence N, sequences 1..N-1 must already exist (no gaps).
   * Sequence 1 always allowed as first phase.
   */
  static assertNoGaps(
    existing: readonly ProjectPhase[],
    sequence: number,
  ): void {
    if (sequence === 1) return;
    const sequences = new Set(existing.map((p) => p.sequence));
    for (let i = 1; i < sequence; i++) {
      if (!sequences.has(i)) {
        throw new PhaseSequenceError(
          `Cannot add phase sequence ${sequence}: missing prior sequence ${i} (no gaps).`,
        );
      }
    }
  }

  static assertSingleActive(
    existing: readonly ProjectPhase[],
    phaseToActivateId?: string,
  ): void {
    const active = existing.filter(
      (p) =>
        p.status === PhaseStatus.ACTIVE && p.id !== phaseToActivateId,
    );
    if (active.length > 0) {
      throw new PhaseSequenceError(
        `Only one active phase allowed; phase "${active[0]!.name.value}" is already ACTIVE.`,
      );
    }
  }

  /**
   * Ordered progression: can only activate sequence N when N-1 is COMPLETED
   * (or N === 1).
   */
  static assertOrderedStart(
    existing: readonly ProjectPhase[],
    phase: ProjectPhase,
  ): void {
    if (phase.sequence === 1) return;
    const prior = existing.find((p) => p.sequence === phase.sequence - 1);
    if (!prior || prior.status !== PhaseStatus.COMPLETED) {
      throw new PhaseSequenceError(
        `Phase sequence ${phase.sequence} cannot start until sequence ${phase.sequence - 1} is COMPLETED.`,
      );
    }
  }
}
