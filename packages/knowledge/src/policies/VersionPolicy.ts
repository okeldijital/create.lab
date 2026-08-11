import type { KnowledgeVersion } from "../aggregates/KnowledgeVersion/KnowledgeVersion.js";
import {
  VersionStatus,
  canTransitionVersion,
} from "../enums/VersionStatus.js";
import { InvalidKnowledgeStateError } from "../errors/KnowledgeErrors.js";

export class VersionPolicy {
  static assertCanTransition(
    version: KnowledgeVersion,
    to: VersionStatus,
  ): void {
    if (version.isSuperseded) {
      throw new InvalidKnowledgeStateError(
        "Superseded versions are immutable.",
      );
    }
    if (
      version.status === VersionStatus.CURRENT &&
      to !== VersionStatus.SUPERSEDED
    ) {
      throw new InvalidKnowledgeStateError(
        "CURRENT versions are immutable except supersession.",
      );
    }
    if (!canTransitionVersion(version.status, to)) {
      throw new InvalidKnowledgeStateError(
        `Illegal version transition: ${version.status} → ${to}.`,
      );
    }
  }

  /**
   * Next version number must be previous + 1 (or 1 when none exist).
   */
  static assertSequential(
    nextNumber: number,
    latestNumber: number | null,
  ): void {
    const expected = latestNumber === null ? 1 : latestNumber + 1;
    if (nextNumber !== expected) {
      throw new InvalidKnowledgeStateError(
        `Version numbers must be sequential. Expected ${expected}, got ${nextNumber}.`,
      );
    }
  }

  static assertCanPromote(version: KnowledgeVersion): void {
    this.assertCanTransition(version, VersionStatus.CURRENT);
  }

  static assertCanSupersede(version: KnowledgeVersion): void {
    if (version.status !== VersionStatus.CURRENT) {
      throw new InvalidKnowledgeStateError(
        "Only CURRENT versions can be superseded.",
      );
    }
    this.assertCanTransition(version, VersionStatus.SUPERSEDED);
  }

  /**
   * At most one CURRENT version among a set of versions for an article.
   */
  static assertSingleCurrent(
    versions: readonly KnowledgeVersion[],
    candidateId?: string,
  ): void {
    const currents = versions.filter((v) => v.isCurrent);
    if (currents.length === 0) return;
    if (currents.length > 1) {
      throw new InvalidKnowledgeStateError(
        "Exactly one CURRENT version is allowed per article.",
      );
    }
    if (candidateId && currents[0]!.id !== candidateId) {
      throw new InvalidKnowledgeStateError(
        "Article already has a CURRENT version; supersede it first.",
      );
    }
  }
}
