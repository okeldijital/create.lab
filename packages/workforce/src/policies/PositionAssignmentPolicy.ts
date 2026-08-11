import type { OrganizationId } from "@creative-lab/organization";
import type { Position } from "../aggregates/Position/Position.js";
import type { Worker } from "../aggregates/Worker/Worker.js";
import { PositionStatus } from "../enums/PositionStatus.js";
import {
  PositionValidationError,
  WorkerValidationError,
} from "../errors/WorkforceErrors.js";

/**
 * Validates position assignment to workers.
 */
export class PositionAssignmentPolicy {
  static assertAssignable(
    position: Position,
    organizationId: OrganizationId,
  ): void {
    if (position.organizationId !== organizationId) {
      throw new PositionValidationError(
        "Position must belong to the worker's organization.",
      );
    }
    if (position.status === PositionStatus.ARCHIVED) {
      throw new PositionValidationError(
        "Cannot assign an archived position.",
      );
    }
    if (position.status === PositionStatus.INACTIVE) {
      throw new PositionValidationError(
        "Cannot assign an inactive position.",
      );
    }
  }

  static assertWorkerCanReceivePosition(worker: Worker): void {
    if (worker.isArchived) {
      throw new WorkerValidationError(
        "Cannot assign a position to an archived worker.",
      );
    }
  }
}
