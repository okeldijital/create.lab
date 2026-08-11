import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  ProjectStatus,
  canTransitionProject,
} from "../../enums/ProjectStatus.js";
import type { ProjectPriority } from "../../enums/ProjectPriority.js";
import { ProjectType } from "../../enums/ProjectType.js";
import { InvalidProjectStateError } from "../../errors/ProjectErrors.js";
import {
  ProjectClosed,
  ProjectCompleted,
  ProjectCreated,
  ProjectStarted,
} from "../../events/project-events.js";
import { asProjectId, type ProjectId } from "../../types/ids.js";
import { BudgetReference } from "../../value-objects/BudgetReference.js";
import { Priority } from "../../value-objects/Priority.js";
import { ProjectDescription } from "../../value-objects/ProjectDescription.js";
import { ProjectName } from "../../value-objects/ProjectName.js";

export type CreateProjectProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  projectType?: ProjectType;
  priority?: ProjectPriority;
  ownerId: string;
  startDate?: Date | null;
  targetEndDate?: Date | null;
  budgetReference?: string | null;
  id?: string;
  now?: Date;
};

export type ProjectSnapshot = {
  id: ProjectId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  projectType: ProjectType;
  priority: ProjectPriority;
  status: ProjectStatus;
  ownerId: string;
  startDate: Date | null;
  targetEndDate: Date | null;
  actualEndDate: Date | null;
  budgetReference: string | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
};

/**
 * Aggregate root: business initiative coordinating work.
 * Does not own execution — references Operations/Allocation/Scheduling by id only.
 */
export class Project extends AggregateRoot<ProjectId> {
  private constructor(
    id: ProjectId,
    private readonly _organizationId: OrganizationId,
    private _name: ProjectName,
    private _description: ProjectDescription,
    private readonly _projectType: ProjectType,
    private _priority: Priority,
    private _status: ProjectStatus,
    private _ownerId: string,
    private _startDate: Date | null,
    private _targetEndDate: Date | null,
    private _actualEndDate: Date | null,
    private _budgetReference: BudgetReference,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _closedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateProjectProps): Project {
    const ownerId = props.ownerId?.trim();
    if (!ownerId) {
      throw new InvalidProjectStateError("Project requires exactly one owner.");
    }
    const projectType = props.projectType ?? ProjectType.INTERNAL;
    if (!Object.values(ProjectType).includes(projectType)) {
      throw new InvalidProjectStateError(
        `Invalid project type: ${String(projectType)}`,
      );
    }
    const targetEnd = props.targetEndDate
      ? new Date(props.targetEndDate)
      : null;
    const startDate = props.startDate ? new Date(props.startDate) : null;
    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new InvalidProjectStateError("startDate must be a valid date.");
    }
    if (targetEnd && Number.isNaN(targetEnd.getTime())) {
      throw new InvalidProjectStateError("targetEndDate must be a valid date.");
    }
    if (startDate && targetEnd && targetEnd.getTime() < startDate.getTime()) {
      throw new InvalidProjectStateError(
        "targetEndDate cannot precede startDate.",
      );
    }

    const now = props.now ?? new Date();
    const id = asProjectId(props.id ?? generateId());
    const project = new Project(
      id,
      props.organizationId,
      ProjectName.create(props.name),
      ProjectDescription.create(props.description),
      projectType,
      Priority.create(props.priority),
      ProjectStatus.CREATED,
      ownerId,
      startDate,
      targetEnd,
      null,
      BudgetReference.create(props.budgetReference),
      now,
      now,
      null,
    );
    project.record(
      ProjectCreated.create({
        organizationId: props.organizationId,
        projectId: id,
        name: project._name.value,
        status: ProjectStatus.CREATED,
        ownerId,
        occurredAt: now,
      }),
    );
    return project;
  }

  static reconstitute(snapshot: ProjectSnapshot): Project {
    return new Project(
      snapshot.id,
      snapshot.organizationId,
      ProjectName.create(snapshot.name),
      ProjectDescription.create(snapshot.description),
      snapshot.projectType,
      Priority.create(snapshot.priority),
      snapshot.status,
      snapshot.ownerId,
      snapshot.startDate ? new Date(snapshot.startDate) : null,
      snapshot.targetEndDate ? new Date(snapshot.targetEndDate) : null,
      snapshot.actualEndDate ? new Date(snapshot.actualEndDate) : null,
      BudgetReference.create(snapshot.budgetReference),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.closedAt ? new Date(snapshot.closedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): ProjectName {
    return this._name;
  }
  get description(): ProjectDescription {
    return this._description;
  }
  get projectType(): ProjectType {
    return this._projectType;
  }
  get priority(): Priority {
    return this._priority;
  }
  get status(): ProjectStatus {
    return this._status;
  }
  get ownerId(): string {
    return this._ownerId;
  }
  get startDate(): Date | null {
    return this._startDate ? new Date(this._startDate) : null;
  }
  get targetEndDate(): Date | null {
    return this._targetEndDate ? new Date(this._targetEndDate) : null;
  }
  get actualEndDate(): Date | null {
    return this._actualEndDate ? new Date(this._actualEndDate) : null;
  }
  get budgetReference(): BudgetReference {
    return this._budgetReference;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get closedAt(): Date | null {
    return this._closedAt ? new Date(this._closedAt) : null;
  }
  get isClosed(): boolean {
    return this._status === ProjectStatus.CLOSED;
  }
  get isActive(): boolean {
    return (
      this._status === ProjectStatus.ACTIVE ||
      this._status === ProjectStatus.PLANNING ||
      this._status === ProjectStatus.ON_HOLD
    );
  }

  plan(now: Date = new Date()): void {
    this.transitionTo(ProjectStatus.PLANNING, now);
  }

  start(now: Date = new Date()): void {
    this.assertNotClosed();
    this.transitionTo(ProjectStatus.ACTIVE, now);
    if (!this._startDate) {
      this._startDate = now;
    }
    this.record(
      ProjectStarted.create({
        organizationId: this._organizationId,
        projectId: this.id,
        occurredAt: now,
      }),
    );
  }

  hold(now: Date = new Date()): void {
    this.transitionTo(ProjectStatus.ON_HOLD, now);
  }

  resume(now: Date = new Date()): void {
    this.transitionTo(ProjectStatus.ACTIVE, now);
  }

  complete(now: Date = new Date()): void {
    this.assertNotClosed();
    if (this._startDate && now.getTime() < this._startDate.getTime()) {
      throw new InvalidProjectStateError(
        "Actual end date cannot precede start date.",
      );
    }
    this.transitionTo(ProjectStatus.COMPLETED, now);
    this._actualEndDate = now;
    this.record(
      ProjectCompleted.create({
        organizationId: this._organizationId,
        projectId: this.id,
        actualEndDate: now,
        occurredAt: now,
      }),
    );
  }

  cancel(now: Date = new Date()): void {
    this.assertNotClosed();
    this.transitionTo(ProjectStatus.CANCELLED, now);
  }

  close(now: Date = new Date()): void {
    this.assertNotClosed();
    this.transitionTo(ProjectStatus.CLOSED, now);
    this._closedAt = now;
    this.record(
      ProjectClosed.create({
        organizationId: this._organizationId,
        projectId: this.id,
        closedAt: now,
        occurredAt: now,
      }),
    );
  }

  transferOwner(ownerId: string, now: Date = new Date()): void {
    this.assertMutable();
    const next = ownerId?.trim();
    if (!next) {
      throw new InvalidProjectStateError("Project requires exactly one owner.");
    }
    this._ownerId = next;
    this._updatedAt = now;
  }

  updateDetails(props: {
    name?: string;
    description?: string | null;
    priority?: ProjectPriority;
    targetEndDate?: Date | null;
    budgetReference?: string | null;
    now?: Date;
  }): void {
    this.assertMutable();
    const now = props.now ?? new Date();
    if (props.name !== undefined) {
      this._name = ProjectName.create(props.name);
    }
    if (props.description !== undefined) {
      this._description = ProjectDescription.create(props.description);
    }
    if (props.priority !== undefined) {
      this._priority = Priority.create(props.priority);
    }
    if (props.targetEndDate !== undefined) {
      const target = props.targetEndDate
        ? new Date(props.targetEndDate)
        : null;
      if (target && Number.isNaN(target.getTime())) {
        throw new InvalidProjectStateError(
          "targetEndDate must be a valid date.",
        );
      }
      if (
        target &&
        this._startDate &&
        target.getTime() < this._startDate.getTime()
      ) {
        throw new InvalidProjectStateError(
          "targetEndDate cannot precede startDate.",
        );
      }
      this._targetEndDate = target;
    }
    if (props.budgetReference !== undefined) {
      this._budgetReference = BudgetReference.create(props.budgetReference);
    }
    this._updatedAt = now;
  }

  toSnapshot(): ProjectSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      description: this._description.value,
      projectType: this._projectType,
      priority: this._priority.value,
      status: this._status,
      ownerId: this._ownerId,
      startDate: this.startDate,
      targetEndDate: this.targetEndDate,
      actualEndDate: this.actualEndDate,
      budgetReference: this._budgetReference.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      closedAt: this.closedAt,
    };
  }

  private transitionTo(to: ProjectStatus, now: Date): void {
    this.assertNotClosed();
    if (!canTransitionProject(this._status, to)) {
      throw new InvalidProjectStateError(
        `Cannot transition project from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertNotClosed(): void {
    if (this._status === ProjectStatus.CLOSED) {
      throw new InvalidProjectStateError(
        "Closed projects are immutable and cannot be reopened.",
      );
    }
  }

  private assertMutable(): void {
    this.assertNotClosed();
    if (
      this._status === ProjectStatus.COMPLETED ||
      this._status === ProjectStatus.CANCELLED
    ) {
      throw new InvalidProjectStateError(
        `Project in status ${this._status} cannot be updated.`,
      );
    }
  }
}
