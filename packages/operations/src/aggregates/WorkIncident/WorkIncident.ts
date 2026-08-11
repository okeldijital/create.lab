import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { IncidentSeverity } from "../../enums/IncidentSeverity.js";
import { IncidentType } from "../../enums/IncidentType.js";
import {
  IncidentAlreadyResolvedError,
  InvalidIncidentStateError,
  InvalidWorkStateError,
} from "../../errors/OperationsErrors.js";
import {
  IncidentReported,
  IncidentResolved,
} from "../../events/operations-events.js";
import {
  asWorkIncidentId,
  type WorkIncidentId,
  type WorkOrderId,
} from "../../types/ids.js";
import { IncidentDescription } from "../../value-objects/IncidentDescription.js";
import { ResolutionNotes } from "../../value-objects/ResolutionNotes.js";

export type CreateWorkIncidentProps = {
  organizationId: OrganizationId;
  workOrderId: WorkOrderId;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  description: string;
  reportedAt?: Date;
  id?: string;
  now?: Date;
};

export type WorkIncidentSnapshot = {
  id: WorkIncidentId;
  organizationId: OrganizationId;
  workOrderId: WorkOrderId;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  description: string;
  reportedAt: Date;
  resolved: boolean;
  resolvedAt: Date | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Operational problem record. Historical; immutable after resolution.
 */
export class WorkIncident extends AggregateRoot<WorkIncidentId> {
  private constructor(
    id: WorkIncidentId,
    private readonly _organizationId: OrganizationId,
    private readonly _workOrderId: WorkOrderId,
    private readonly _incidentType: IncidentType,
    private readonly _severity: IncidentSeverity,
    private readonly _description: IncidentDescription,
    private readonly _reportedAt: Date,
    private _resolved: boolean,
    private _resolvedAt: Date | null,
    private _resolution: ResolutionNotes | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateWorkIncidentProps): WorkIncident {
    if (!props.workOrderId) {
      throw new InvalidWorkStateError("Incident requires a work order.");
    }
    if (!Object.values(IncidentType).includes(props.incidentType)) {
      throw new InvalidIncidentStateError(
        `Invalid incident type: ${String(props.incidentType)}`,
      );
    }
    if (!Object.values(IncidentSeverity).includes(props.severity)) {
      throw new InvalidIncidentStateError(
        `Invalid incident severity: ${String(props.severity)}`,
      );
    }
    const now = props.now ?? new Date();
    const reportedAt = props.reportedAt ? new Date(props.reportedAt) : now;
    if (Number.isNaN(reportedAt.getTime())) {
      throw new InvalidIncidentStateError(
        "Incident reportedAt must be a valid date.",
      );
    }
    const id = asWorkIncidentId(props.id ?? generateId());
    const incident = new WorkIncident(
      id,
      props.organizationId,
      props.workOrderId,
      props.incidentType,
      props.severity,
      IncidentDescription.create(props.description),
      reportedAt,
      false,
      null,
      null,
      now,
      now,
    );
    incident.record(
      IncidentReported.create({
        organizationId: props.organizationId,
        incidentId: id,
        workOrderId: props.workOrderId,
        incidentType: props.incidentType,
        severity: props.severity,
        occurredAt: now,
      }),
    );
    return incident;
  }

  static reconstitute(snapshot: WorkIncidentSnapshot): WorkIncident {
    return new WorkIncident(
      snapshot.id,
      snapshot.organizationId,
      snapshot.workOrderId,
      snapshot.incidentType,
      snapshot.severity,
      IncidentDescription.create(snapshot.description),
      new Date(snapshot.reportedAt),
      snapshot.resolved,
      snapshot.resolvedAt ? new Date(snapshot.resolvedAt) : null,
      snapshot.resolution
        ? ResolutionNotes.create(snapshot.resolution)
        : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get workOrderId(): WorkOrderId {
    return this._workOrderId;
  }
  get incidentType(): IncidentType {
    return this._incidentType;
  }
  get severity(): IncidentSeverity {
    return this._severity;
  }
  get description(): IncidentDescription {
    return this._description;
  }
  get reportedAt(): Date {
    return new Date(this._reportedAt);
  }
  get resolved(): boolean {
    return this._resolved;
  }
  get resolvedAt(): Date | null {
    return this._resolvedAt ? new Date(this._resolvedAt) : null;
  }
  get resolution(): ResolutionNotes | null {
    return this._resolution;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  resolve(resolution: string, now: Date = new Date()): void {
    if (this._resolved) {
      throw new IncidentAlreadyResolvedError(this.id);
    }
    this._resolution = ResolutionNotes.create(resolution);
    this._resolved = true;
    this._resolvedAt = now;
    this._updatedAt = now;
    this.record(
      IncidentResolved.create({
        organizationId: this._organizationId,
        incidentId: this.id,
        workOrderId: this._workOrderId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): WorkIncidentSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      workOrderId: this._workOrderId,
      incidentType: this._incidentType,
      severity: this._severity,
      description: this._description.value,
      reportedAt: this.reportedAt,
      resolved: this._resolved,
      resolvedAt: this.resolvedAt,
      resolution: this._resolution?.value ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
