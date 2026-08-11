import type { ProductionSession } from "../aggregates/ProductionSession/ProductionSession.js";
import {
  InvalidSessionError,
  SessionAlreadyOpenError,
} from "../errors/ProductionErrors.js";
import type { ProductionId } from "../types/ids.js";

export class SessionPolicy {
  static assertNoOpenSession(
    existing: readonly ProductionSession[],
    productionId: ProductionId,
  ): void {
    const open = existing.find(
      (s) => s.productionId === productionId && s.isOpen,
    );
    if (open) {
      throw new SessionAlreadyOpenError(productionId);
    }
  }

  static assertEndAfterStart(startedAt: Date, endedAt: Date): void {
    if (endedAt.getTime() <= startedAt.getTime()) {
      throw new InvalidSessionError(
        "Session end must be after start (positive duration).",
      );
    }
  }
}
