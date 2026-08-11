import type { Employment } from "../aggregates/Employment/Employment.js";
import type { Worker } from "../aggregates/Worker/Worker.js";
import {
  EmploymentConflictError,
  WorkerArchivedError,
} from "../errors/WorkforceErrors.js";
import { WorkerStatus } from "../enums/WorkerStatus.js";

/**
 * Validates employment transitions against worker lifecycle state.
 */
export class EmploymentLifecyclePolicy {
  static assertCanStartEmployment(worker: Worker): void {
    if (worker.isArchived) {
      throw new WorkerArchivedError(worker.id);
    }
    if (
      worker.status === WorkerStatus.TERMINATED ||
      worker.status === WorkerStatus.INACTIVE
    ) {
      throw new EmploymentConflictError(
        `Cannot start employment for worker in status ${worker.status}.`,
      );
    }
  }

  static assertNoActiveEmployment(
    existingActive: Employment | null,
  ): void {
    if (existingActive) {
      throw new EmploymentConflictError(
        `Worker already has active employment "${existingActive.id}".`,
      );
    }
  }

  static assertCanModifyEmployment(
    worker: Worker,
    employment: Employment,
  ): void {
    if (worker.isArchived) {
      throw new WorkerArchivedError(worker.id);
    }
    if (employment.workerId !== worker.id) {
      throw new EmploymentConflictError(
        "Employment does not belong to the given worker.",
      );
    }
  }
}
