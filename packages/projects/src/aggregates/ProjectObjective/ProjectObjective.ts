import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ObjectiveStatus } from "../../enums/ObjectiveStatus.js";
import {
  InvalidProjectStateError,
  ObjectiveAlreadyCompletedError,
} from "../../errors/ProjectErrors.js";
import { ObjectiveAchieved } from "../../events/project-events.js";
import {
  asProjectObjectiveId,
  type ProjectId,
  type ProjectObjectiveId,
} from "../../types/ids.js";
import { ObjectiveName } from "../../value-objects/ObjectiveName.js";
import { ObjectiveProgress } from "../../value-objects/ObjectiveProgress.js";
import { ProjectDescription } from "../../value-objects/ProjectDescription.js";

export type CreateProjectObjectiveProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  name: string;
  description?: string | null;
  targetValue?: number;
  currentValue?: number;
  id?: string;
  now?: Date;
};

export type ProjectObjectiveSnapshot = {
  id: ProjectObjectiveId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  name: string;
  description: string | null;
  status: ObjectiveStatus;
  targetValue: number;
  currentValue: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Measurable project goal. Immutable after ACHIEVED/FAILED.
 * Progress is derived as (currentValue / targetValue) * 100, clamped 0–100.
 */
export class ProjectObjective extends AggregateRoot<ProjectObjectiveId> {
  private constructor(
    id: ProjectObjectiveId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _name: ObjectiveName,
    private _description: ProjectDescription,
    private _status: ObjectiveStatus,
    private readonly _targetValue: number,
    private _currentValue: number,
    private _completedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateProjectObjectiveProps): ProjectObjective {
    if (!props.projectId) {
      throw new InvalidProjectStateError("Objective requires a project.");
    }
    const targetValue = props.targetValue ?? 100;
    const currentValue = props.currentValue ?? 0;
    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      throw new InvalidProjectStateError(
        "Objective targetValue must be a positive number.",
      );
    }
    if (!Number.isFinite(currentValue) || currentValue < 0) {
      throw new InvalidProjectStateError(
        "Objective currentValue must be ≥ 0.",
      );
    }
    // validate progress range via VO
    ObjectiveProgress.create(
      Math.min(100, (currentValue / targetValue) * 100),
    );

    const now = props.now ?? new Date();
    const id = asProjectObjectiveId(props.id ?? generateId());
    let status: ObjectiveStatus = ObjectiveStatus.NOT_STARTED;
    if (currentValue >= targetValue) {
      status = ObjectiveStatus.ACHIEVED;
    } else if (currentValue > 0) {
      status = ObjectiveStatus.IN_PROGRESS;
    }

    return new ProjectObjective(
      id,
      props.organizationId,
      props.projectId,
      ObjectiveName.create(props.name),
      ProjectDescription.create(props.description),
      status,
      targetValue,
      currentValue,
      status === ObjectiveStatus.ACHIEVED ? now : null,
      now,
      now,
    );
  }

  static reconstitute(
    snapshot: ProjectObjectiveSnapshot,
  ): ProjectObjective {
    return new ProjectObjective(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      ObjectiveName.create(snapshot.name),
      ProjectDescription.create(snapshot.description),
      snapshot.status,
      snapshot.targetValue,
      snapshot.currentValue,
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
  get name(): ObjectiveName {
    return this._name;
  }
  get description(): ProjectDescription {
    return this._description;
  }
  get status(): ObjectiveStatus {
    return this._status;
  }
  get targetValue(): number {
    return this._targetValue;
  }
  get currentValue(): number {
    return this._currentValue;
  }
  get progress(): ObjectiveProgress {
    const pct = Math.min(
      100,
      Math.max(0, (this._currentValue / this._targetValue) * 100),
    );
    return ObjectiveProgress.create(pct);
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
  get isTerminal(): boolean {
    return (
      this._status === ObjectiveStatus.ACHIEVED ||
      this._status === ObjectiveStatus.FAILED
    );
  }

  updateProgress(currentValue: number, now: Date = new Date()): void {
    this.assertMutable();
    if (!Number.isFinite(currentValue) || currentValue < 0) {
      throw new InvalidProjectStateError(
        "Objective currentValue must be ≥ 0.",
      );
    }
    this._currentValue = currentValue;
    const pct = Math.min(100, (currentValue / this._targetValue) * 100);
    ObjectiveProgress.create(pct);
    if (currentValue >= this._targetValue) {
      this.achieve(now);
      return;
    }
    this._status =
      currentValue > 0
        ? ObjectiveStatus.IN_PROGRESS
        : ObjectiveStatus.NOT_STARTED;
    this._updatedAt = now;
  }

  achieve(now: Date = new Date()): void {
    this.assertMutable();
    this._currentValue = Math.max(this._currentValue, this._targetValue);
    this._status = ObjectiveStatus.ACHIEVED;
    this._completedAt = now;
    this._updatedAt = now;
    this.record(
      ObjectiveAchieved.create({
        organizationId: this._organizationId,
        objectiveId: this.id,
        projectId: this._projectId,
        name: this._name.value,
        occurredAt: now,
      }),
    );
  }

  fail(now: Date = new Date()): void {
    this.assertMutable();
    this._status = ObjectiveStatus.FAILED;
    this._completedAt = now;
    this._updatedAt = now;
  }

  toSnapshot(): ProjectObjectiveSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      name: this._name.value,
      description: this._description.value,
      status: this._status,
      targetValue: this._targetValue,
      currentValue: this._currentValue,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertMutable(): void {
    if (this.isTerminal) {
      throw new ObjectiveAlreadyCompletedError(this._name.value);
    }
  }
}
