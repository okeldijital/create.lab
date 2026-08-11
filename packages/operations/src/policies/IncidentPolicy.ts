import type { WorkIncident } from "../aggregates/WorkIncident/WorkIncident.js";
import {
  IncidentAlreadyResolvedError,
  InvalidIncidentStateError,
} from "../errors/OperationsErrors.js";

/**
 * Incident resolution invariants.
 */
export class IncidentPolicy {
  static assertUnresolved(incident: WorkIncident): void {
    if (incident.resolved) {
      throw new IncidentAlreadyResolvedError(incident.id);
    }
  }

  static assertCanResolve(
    incident: WorkIncident,
    resolution: string | null | undefined,
  ): void {
    IncidentPolicy.assertUnresolved(incident);
    if (resolution === null || resolution === undefined || !resolution.trim()) {
      throw new InvalidIncidentStateError(
        "Resolution notes are required to resolve an incident.",
      );
    }
  }
}
