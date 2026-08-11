import type { ProductionMilestone } from "../aggregates/ProductionMilestone/ProductionMilestone.js";
import { MilestoneStatus } from "../enums/MilestoneStatus.js";
import {
  DuplicateMilestoneError,
  MilestoneSequenceError,
} from "../errors/ProductionErrors.js";

export class MilestonePolicy {
  static assertUniqueSequence(
    existing: readonly ProductionMilestone[],
    sequence: number,
    excludeId?: string,
  ): void {
    const dup = existing.find(
      (m) => m.id !== excludeId && m.sequence === sequence,
    );
    if (dup) {
      throw new DuplicateMilestoneError(
        `Milestone sequence ${sequence} already exists on this production.`,
      );
    }
  }

  static assertNoGaps(
    existing: readonly ProductionMilestone[],
    sequence: number,
  ): void {
    if (sequence === 1) return;
    const sequences = new Set(existing.map((m) => m.sequence));
    for (let i = 1; i < sequence; i++) {
      if (!sequences.has(i)) {
        throw new MilestoneSequenceError(
          `Cannot add milestone sequence ${sequence}: missing prior sequence ${i} (no gaps).`,
        );
      }
    }
  }

  static assertSingleActive(
    existing: readonly ProductionMilestone[],
    excludeId?: string,
  ): void {
    const active = existing.filter(
      (m) =>
        m.status === MilestoneStatus.ACTIVE && m.id !== excludeId,
    );
    if (active.length > 0) {
      throw new MilestoneSequenceError(
        `Only one active milestone allowed; "${active[0]!.name.value}" is already ACTIVE.`,
      );
    }
  }

  static assertOrderedActivation(
    existing: readonly ProductionMilestone[],
    milestone: ProductionMilestone,
  ): void {
    if (milestone.sequence === 1) return;
    const prior = existing.find(
      (m) => m.sequence === milestone.sequence - 1,
    );
    if (!prior || prior.status !== MilestoneStatus.COMPLETED) {
      throw new MilestoneSequenceError(
        `Milestone sequence ${milestone.sequence} cannot activate until sequence ${milestone.sequence - 1} is COMPLETED.`,
      );
    }
  }
}
