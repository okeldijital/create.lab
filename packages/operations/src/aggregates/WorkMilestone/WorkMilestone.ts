import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  InvalidWorkStateError,
  MilestoneAlreadyCompletedError,
} from "../../errors/OperationsErrors.js";
import { MilestoneCompleted } from "../../events/operations-events.js";
import {
  asWorkMilestoneId,
  type WorkMilestoneId,
  type WorkOrderId,
} from "../../types/ids.js";
import { MilestoneName } from "../../value-objects/MilestoneName.js";

export type CreateWorkMilestoneProps = {
  organizationId: OrganizationId;
  workOrderId: WorkOrderId;
  name: string;
  notes?: string | null;
  id?: string;
  now?: Date;
};

export type WorkMilestoneSnapshot = {
  id: WorkMilestoneId;
  organizationId: OrganizationId;
  workOrderId: WorkOrderId;
  name: string;
  completed: boolean;
  completedAt: Date | null;
  completedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Meaningful execution progress marker on a WorkOrder.
 * Immutable after completion; historical milestones are retained.
 */
export class WorkMilestone extends AggregateRoot<WorkMilestoneId> {
  private constructor(
    id: WorkMilestoneId,
    private readonly _organizationId: OrganizationId,
    private readonly _workOrderId: WorkOrderId,
    private readonly _name: MilestoneName,
    private _completed: boolean,
    private _completedAt: Date | null,
    private _completedBy: string | null,
    private _notes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateWorkMilestoneProps): WorkMilestone {
    if (!props.workOrderId) {
      throw new InvalidWorkStateError("Milestone requires a work order.");
    }
    const now = props.now ?? new Date();
    const id = asWorkMilestoneId(props.id ?? generateId());
    const notes =
      props.notes === null || props.notes === undefined
        ? null
        : props.notes.trim() || null;
    if (notes && notes.length > 2000) {
      throw new InvalidWorkStateError(
        "Milestone notes must be at most 2000 characters.",
      );
    }
    return new WorkMilestone(
      id,
      props.organizationId,
      props.workOrderId,
      MilestoneName.create(props.name),
      false,
      null,
      null,
      notes,
      now,
      now,
    );
  }

  static reconstitute(snapshot: WorkMilestoneSnapshot): WorkMilestone {
    return new WorkMilestone(
      snapshot.id,
      snapshot.organizationId,
      snapshot.workOrderId,
      MilestoneName.create(snapshot.name),
      snapshot.completed,
      snapshot.completedAt ? new Date(snapshot.completedAt) : null,
      snapshot.completedBy,
      snapshot.notes,
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
  get name(): MilestoneName {
    return this._name;
  }
  get completed(): boolean {
    return this._completed;
  }
  get completedAt(): Date | null {
    return this._completedAt ? new Date(this._completedAt) : null;
  }
  get completedBy(): string | null {
    return this._completedBy;
  }
  get notes(): string | null {
    return this._notes;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  complete(completedBy?: string | null, now: Date = new Date()): void {
    if (this._completed) {
      throw new MilestoneAlreadyCompletedError(this._name.value);
    }
    this._completed = true;
    this._completedAt = now;
    this._completedBy = completedBy?.trim() || null;
    this._updatedAt = now;
    this.record(
      MilestoneCompleted.create({
        organizationId: this._organizationId,
        milestoneId: this.id,
        workOrderId: this._workOrderId,
        name: this._name.value,
        occurredAt: now,
      }),
    );
  }

  updateNotes(notes: string | null, now: Date = new Date()): void {
    if (this._completed) {
      throw new MilestoneAlreadyCompletedError(this._name.value);
    }
    if (notes === null || notes === undefined) {
      this._notes = null;
    } else {
      const trimmed = notes.trim();
      if (trimmed.length > 2000) {
        throw new InvalidWorkStateError(
          "Milestone notes must be at most 2000 characters.",
        );
      }
      this._notes = trimmed || null;
    }
    this._updatedAt = now;
  }

  toSnapshot(): WorkMilestoneSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      workOrderId: this._workOrderId,
      name: this._name.value,
      completed: this._completed,
      completedAt: this.completedAt,
      completedBy: this._completedBy,
      notes: this._notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
