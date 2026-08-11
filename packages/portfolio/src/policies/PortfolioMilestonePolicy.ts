import type { PortfolioMilestone } from "../aggregates/PortfolioMilestone/PortfolioMilestone.js";
import { MilestoneStatus } from "../enums/MilestoneStatus.js";
import { PortfolioValidationError } from "../errors/PortfolioErrors.js";

export class PortfolioMilestonePolicy {
  static assertUniqueSequence(
    sequence: number,
    existing: readonly PortfolioMilestone[],
    excludeId?: string,
  ): void {
    const dup = existing.find(
      (m) => m.sequence === sequence && m.id !== excludeId,
    );
    if (dup) {
      throw new PortfolioValidationError(
        `Milestone sequence ${sequence} is already used.`,
      );
    }
  }

  static assertChronological(
    sequence: number,
    targetDate: Date,
    existing: readonly PortfolioMilestone[],
  ): void {
    const t = targetDate.getTime();
    for (const m of existing) {
      if (m.sequence < sequence && m.targetDate.getTime() > t) {
        throw new PortfolioValidationError(
          "Milestone target dates must be chronological with sequence.",
        );
      }
      if (m.sequence > sequence && m.targetDate.getTime() < t) {
        throw new PortfolioValidationError(
          "Milestone target dates must be chronological with sequence.",
        );
      }
    }
  }

  static assertOneActive(
    existing: readonly PortfolioMilestone[],
    activatingId?: string,
  ): void {
    const active = existing.find(
      (m) => m.status === MilestoneStatus.ACTIVE && m.id !== activatingId,
    );
    if (active) {
      throw new PortfolioValidationError(
        "Only one portfolio milestone may be ACTIVE at a time.",
      );
    }
  }

  static nextSequence(existing: readonly PortfolioMilestone[]): number {
    return existing.reduce((m, x) => Math.max(m, x.sequence), 0) + 1;
  }
}
