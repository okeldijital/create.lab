import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { PhaseStatus } from "../../enums/PhaseStatus.js";
import {
  InvalidProjectStateError,
  PhaseSequenceError,
} from "../../errors/ProjectErrors.js";
import {
  PhaseCompleted,
  PhaseStarted,
} from "../../events/project-events.js";
import {
  asProjectPhaseId,
  type ProjectId,
  type ProjectPhaseId,
} from "../../types/ids.js";
import { PhaseName } from "../../value-objects/PhaseName.js";

export type CreateProjectPhaseProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  name: string;
  sequence: number;
  id?: string;
  now?: Date;
};

export type ProjectPhaseSnapshot = {
  id: ProjectPhaseId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  name: string;
  sequence: number;
  status: PhaseStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Major stage within a project. Sequence unique; one ACTIVE phase at a time (policy).
 */
export class ProjectPhase extends AggregateRoot<ProjectPhaseId> {
  private constructor(
    id: ProjectPhaseId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _name: PhaseName,
    private readonly _sequence: number,
    private _status: PhaseStatus,
    private _startedAt: Date | null,
    private _completedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateProjectPhaseProps): ProjectPhase {
    if (!props.projectId) {
      throw new InvalidProjectStateError("Phase requires a project.");
    }
    if (!Number.isInteger(props.sequence) || props.sequence < 1) {
      throw new PhaseSequenceError(
        `Phase sequence must be an integer ≥ 1 (received ${props.sequence}).`,
      );
    }
    const now = props.now ?? new Date();
    const id = asProjectPhaseId(props.id ?? generateId());
    return new ProjectPhase(
      id,
      props.organizationId,
      props.projectId,
      PhaseName.create(props.name),
      props.sequence,
      PhaseStatus.PENDING,
      null,
      null,
      now,
      now,
    );
  }

  static reconstitute(snapshot: ProjectPhaseSnapshot): ProjectPhase {
    return new ProjectPhase(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      PhaseName.create(snapshot.name),
      snapshot.sequence,
      snapshot.status,
      snapshot.startedAt ? new Date(snapshot.startedAt) : null,
      snapshot.completedAt ? new Date(snapshot.completedAt) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get projectId(): ProjectId {
    return this._projectId;
  }
  get name(): PhaseName {
    return this._name;
  }
  get sequence(): number {
    return this._sequence;
  }
  get status(): PhaseStatus {
    return this._status;
  }
  get startedAt(): Date | null {
    return this._startedAt ? new Date(this._startedAt) : null;
  }
  get completedAt(): Date | null {
    return this._completedAt ? new Date(this._completedAt) : null;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isActive(): boolean {
    return this._status === PhaseStatus.ACTIVE;
  }
  get isCompleted(): boolean {
    return this._status === PhaseStatus.COMPLETED;
  }

  start(now: Date = new Date()): void {
    if (this._status === PhaseStatus.COMPLETED) {
      throw new PhaseSequenceError(
        `Completed phase "${this._name.value}" is immutable.`,
      );
    }
    if (this._status === PhaseStatus.ACTIVE) return;
    if (this._status !== PhaseStatus.PENDING) {
      throw new PhaseSequenceError(
        `Cannot start phase in status ${this._status}.`,
      );
    }
    this._status = PhaseStatus.ACTIVE;
    this._startedAt = now;
    this._updatedAt = now;
    this.record(
      PhaseStarted.create({
        organizationId: this._organizationId,
        phaseId: this.id,
        projectId: this._projectId,
        name: this._name.value,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    if (this._status === PhaseStatus.COMPLETED) {
      throw new PhaseSequenceError(
        `Phase "${this._name.value}" is already completed and immutable.`,
      );
    }
    if (this._status !== PhaseStatus.ACTIVE) {
      throw new PhaseSequenceError(
        `Only ACTIVE phases can be completed (status: ${this._status}).`,
      );
    }
    this._status = PhaseStatus.COMPLETED;
    this._completedAt = now;
    this._updatedAt = now;
    this.record(
      PhaseCompleted.create({
        organizationId: this._organizationId,
        phaseId: this.id,
        projectId: this._projectId,
        name: this._name.value,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ProjectPhaseSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      name: this._name.value,
      sequence: this._sequence,
      status: this._status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
