import type { Program } from "../aggregates/Program/Program.js";
import { ProgramStatus } from "../enums/ProgramStatus.js";
import {
  InvalidPortfolioStateError,
  ProgramSequenceError,
} from "../errors/PortfolioErrors.js";

export class ProgramPolicy {
  static assertUniqueSequence(
    sequence: number,
    existing: readonly Program[],
    excludeId?: string,
  ): void {
    const dup = existing.find(
      (p) => p.sequence === sequence && p.id !== excludeId,
    );
    if (dup) {
      throw new ProgramSequenceError(
        `Program sequence ${sequence} is already used in this portfolio.`,
      );
    }
  }

  static assertEditable(program: Program): void {
    if (program.status === ProgramStatus.ARCHIVED) {
      throw new InvalidPortfolioStateError(
        "Archived programs are immutable.",
      );
    }
  }

  static nextSequence(existing: readonly Program[]): number {
    return existing.reduce((m, p) => Math.max(m, p.sequence), 0) + 1;
  }
}
