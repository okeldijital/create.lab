import type { Milestone } from "../aggregates/Milestone/Milestone.js";
import { MilestoneStatus } from "../enums/MilestoneStatus.js";
import { MilestoneSequenceError } from "../errors/EngagementErrors.js";
import { TargetDate } from "../value-objects/TargetDate.js";

export class MilestonePolicy {
  static assertUniqueSequence(
    sequence: number,
    existing: readonly Milestone[],
    excludeId?: string,
  ): void {
    const dup = existing.find(
      (m) => m.sequence === sequence && m.id !== excludeId,
    );
    if (dup) {
      throw new MilestoneSequenceError(
        `Milestone sequence ${sequence} is already used.`,
      );
    }
  }

  static assertChronological(
    sequence: number,
    targetDate: Date,
    existing: readonly Milestone[],
  ): void {
    const target = TargetDate.create(targetDate);
    for (const m of existing) {
      if (m.sequence < sequence) {
        if (TargetDate.create(m.targetDate).isAfter(target)) {
          throw new MilestoneSequenceError(
            "Milestone target dates must be chronological with sequence.",
          );
        }
      }
      if (m.sequence > sequence) {
        if (TargetDate.create(m.targetDate).isBefore(target)) {
          throw new MilestoneSequenceError(
            "Milestone target dates must be chronological with sequence.",
          );
        }
      }
    }
  }

  static assertOneActive(
    existing: readonly Milestone[],
    activatingId?: string,
  ): void {
    const active = existing.find(
      (m) =>
        m.status === MilestoneStatus.ACTIVE && m.id !== activatingId,
    );
    if (active) {
      throw new MilestoneSequenceError(
        "Only one milestone may be ACTIVE at a time.",
      );
    }
  }

  static nextSequence(existing: readonly Milestone[]): number {
    return existing.reduce((m, x) => Math.max(m, x.sequence), 0) + 1;
  }
}
