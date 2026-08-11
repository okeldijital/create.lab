import type { WorkSession } from "../aggregates/WorkSession/WorkSession.js";
import { SessionOverlapError } from "../errors/OperationsErrors.js";
import { rangesOverlap } from "../utils/time.js";

export type SessionInterval = {
  startedAt: Date;
  endedAt: Date | null;
  id?: string;
};

/**
 * Session non-overlap and duration invariants.
 */
export class SessionPolicy {
  /**
   * Assert a proposed session interval does not overlap existing sessions
   * on the same work order.
   *
   * Open sessions (`endedAt` null) extend to the far future so concurrent
   * open sessions always conflict. Completed sessions use half-open
   * [start, end) semantics (adjacent endpoints are allowed).
   */
  static assertNoOverlap(
    existing: readonly SessionInterval[],
    proposed: SessionInterval,
    now: Date = new Date(),
  ): void {
    void now;
    const openEnd = new Date(8_640_000_000_000_000); // far future
    const pStart = proposed.startedAt;
    const pEnd = proposed.endedAt ?? openEnd;
    if (proposed.endedAt && pEnd.getTime() <= pStart.getTime()) {
      throw new SessionOverlapError(
        "Session end must be after start (positive duration).",
      );
    }
    for (const s of existing) {
      if (proposed.id && s.id && proposed.id === s.id) continue;
      const sStart = s.startedAt;
      const sEnd = s.endedAt ?? openEnd;
      if (rangesOverlap(pStart, pEnd, sStart, sEnd)) {
        throw new SessionOverlapError(
          `Session overlaps existing session${s.id ? ` "${s.id}"` : ""}.`,
        );
      }
    }
  }

  static assertNoOverlapWithSessions(
    existing: readonly WorkSession[],
    proposed: SessionInterval,
    now: Date = new Date(),
  ): void {
    SessionPolicy.assertNoOverlap(
      existing.map((s) => ({
        id: s.id,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      })),
      proposed,
      now,
    );
  }
}
