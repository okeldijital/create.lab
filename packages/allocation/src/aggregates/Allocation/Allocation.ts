import { AggregateRoot, generateId } from "@creative-lab/core";
import type { ResourceId } from "@creative-lab/capacity";
import type { OrganizationId } from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import type { ProjectId } from "@creative-lab/projects";
import {
  AllocationStatus,
  canTransitionAllocation,
  isActiveAllocationStatus,
} from "../../enums/AllocationStatus.js";
import type { AllocationPriority as AllocationPriorityEnum } from "../../enums/AllocationPriority.js";
import { ResourceType } from "../../enums/ResourceType.js";
import { InvalidAllocationStateError } from "../../errors/AllocationErrors.js";
import {
  AllocationActivated,
  AllocationArchived,
  AllocationCancelled,
  AllocationCompleted,
  AllocationCreated,
  AllocationUpdated,
} from "../../events/allocation-events.js";
import { asAllocationId, type AllocationId } from "../../types/ids.js";
import { AllocationNotes } from "../../value-objects/AllocationNotes.js";
import { AllocationPercentage } from "../../value-objects/AllocationPercentage.js";
import { AllocationPriorityVO } from "../../value-objects/AllocationPriority.js";

export type CreateAllocationProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  workOrderId: WorkOrderId;
  resourceId: ResourceId | string;
  resourceType: ResourceType;
  allocationPercentage: number;
  startDate: Date;
  endDate: Date;
  priority?: AllocationPriorityEnum;
  notes?: string | null;
  id?: string;
  now?: Date;
  /** When converting from reservation */
  skipCreatedEvent?: boolean;
};

export type AllocationSnapshot = {
  id: AllocationId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  workOrderId: WorkOrderId;
  resourceId: string;
  resourceType: ResourceType;
  status: AllocationStatus;
  allocationPercentage: number;
  startDate: Date;
  endDate: Date;
  priority: AllocationPriorityEnum;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Commitment of a resource to work.
 * References Project and WorkOrder by id only — no scheduling or capacity math.
 */
export class Allocation extends AggregateRoot<AllocationId> {
  private constructor(
    id: AllocationId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _workOrderId: WorkOrderId,
    private readonly _resourceId: string,
    private readonly _resourceType: ResourceType,
    private _status: AllocationStatus,
    private _percentage: AllocationPercentage,
    private _startDate: Date,
    private _endDate: Date,
    private _priority: AllocationPriorityVO,
    private _notes: AllocationNotes,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateAllocationProps): Allocation {
    if (!props.projectId) {
      throw new InvalidAllocationStateError("Allocation requires a project reference.");
    }
    if (!props.workOrderId) {
      throw new InvalidAllocationStateError(
        "Allocation requires a work order reference.",
      );
    }
    if (!props.resourceId) {
      throw new InvalidAllocationStateError(
        "Allocation requires a resource identity.",
      );
    }
    if (!Object.values(ResourceType).includes(props.resourceType)) {
      throw new InvalidAllocationStateError(
        `Invalid resource type: ${String(props.resourceType)}`,
      );
    }
    const start = new Date(props.startDate);
    const end = new Date(props.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new InvalidAllocationStateError(
        "Allocation start/end must be valid dates.",
      );
    }
    if (end.getTime() <= start.getTime()) {
      throw new InvalidAllocationStateError(
        "Allocation endDate must be after startDate.",
      );
    }

    const now = props.now ?? new Date();
    const id = asAllocationId(props.id ?? generateId());
    const allocation = new Allocation(
      id,
      props.organizationId,
      props.projectId,
      props.workOrderId,
      String(props.resourceId),
      props.resourceType,
      AllocationStatus.PLANNED,
      AllocationPercentage.create(props.allocationPercentage),
      start,
      end,
      AllocationPriorityVO.create(props.priority),
      AllocationNotes.create(props.notes),
      now,
      now,
    );
    if (!props.skipCreatedEvent) {
      allocation.record(
        AllocationCreated.create({
          organizationId: props.organizationId,
          allocationId: id,
          resourceId: allocation._resourceId,
          resourceType: props.resourceType,
          projectId: props.projectId,
          workOrderId: props.workOrderId,
          status: AllocationStatus.PLANNED,
          percentage: allocation._percentage.value,
          occurredAt: now,
        }),
      );
    }
    return allocation;
  }

  static reconstitute(snapshot: AllocationSnapshot): Allocation {
    return new Allocation(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      snapshot.workOrderId,
      snapshot.resourceId,
      snapshot.resourceType,
      snapshot.status,
      AllocationPercentage.create(snapshot.allocationPercentage),
      new Date(snapshot.startDate),
      new Date(snapshot.endDate),
      AllocationPriorityVO.create(snapshot.priority),
      AllocationNotes.create(snapshot.notes),
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
  get workOrderId(): WorkOrderId {
    return this._workOrderId;
  }
  get resourceId(): string {
    return this._resourceId;
  }
  get resourceType(): ResourceType {
    return this._resourceType;
  }
  get status(): AllocationStatus {
    return this._status;
  }
  get allocationPercentage(): AllocationPercentage {
    return this._percentage;
  }
  get startDate(): Date {
    return new Date(this._startDate);
  }
  get endDate(): Date {
    return new Date(this._endDate);
  }
  get priority(): AllocationPriorityVO {
    return this._priority;
  }
  get notes(): AllocationNotes {
    return this._notes;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isArchived(): boolean {
    return this._status === AllocationStatus.ARCHIVED;
  }
  get isActiveCommitment(): boolean {
    return isActiveAllocationStatus(this._status);
  }

  activate(now: Date = new Date()): void {
    this.transitionTo(AllocationStatus.ACTIVE, now);
    this.record(
      AllocationActivated.create({
        organizationId: this._organizationId,
        allocationId: this.id,
        occurredAt: now,
      }),
    );
  }

  hold(now: Date = new Date()): void {
    this.transitionTo(AllocationStatus.ON_HOLD, now);
    this.record(
      AllocationUpdated.create({
        organizationId: this._organizationId,
        allocationId: this.id,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    this.transitionTo(AllocationStatus.COMPLETED, now);
    this.record(
      AllocationCompleted.create({
        organizationId: this._organizationId,
        allocationId: this.id,
        occurredAt: now,
      }),
    );
  }

  cancel(now: Date = new Date()): void {
    this.transitionTo(AllocationStatus.CANCELLED, now);
    this.record(
      AllocationCancelled.create({
        organizationId: this._organizationId,
        allocationId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    this.transitionTo(AllocationStatus.ARCHIVED, now);
    this.record(
      AllocationArchived.create({
        organizationId: this._organizationId,
        allocationId: this.id,
        occurredAt: now,
      }),
    );
  }

  update(props: {
    allocationPercentage?: number;
    startDate?: Date;
    endDate?: Date;
    priority?: AllocationPriorityEnum;
    notes?: string | null;
    now?: Date;
  }): void {
    this.assertMutable();
    const now = props.now ?? new Date();
    if (props.allocationPercentage !== undefined) {
      this._percentage = AllocationPercentage.create(props.allocationPercentage);
    }
    const start = props.startDate
      ? new Date(props.startDate)
      : this._startDate;
    const end = props.endDate ? new Date(props.endDate) : this._endDate;
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new InvalidAllocationStateError(
        "Allocation start/end must be valid dates.",
      );
    }
    if (end.getTime() <= start.getTime()) {
      throw new InvalidAllocationStateError(
        "Allocation endDate must be after startDate.",
      );
    }
    this._startDate = start;
    this._endDate = end;
    if (props.priority !== undefined) {
      this._priority = AllocationPriorityVO.create(props.priority);
    }
    if (props.notes !== undefined) {
      this._notes = AllocationNotes.create(props.notes);
    }
    this._updatedAt = now;
    this.record(
      AllocationUpdated.create({
        organizationId: this._organizationId,
        allocationId: this.id,
        occurredAt: now,
      }),
    );
  }

  /** Used when service creates allocation from reservation conversion. */
  recordCreatedFromReservation(now: Date = new Date()): void {
    this.record(
      AllocationCreated.create({
        organizationId: this._organizationId,
        allocationId: this.id,
        resourceId: this._resourceId,
        resourceType: this._resourceType,
        projectId: this._projectId,
        workOrderId: this._workOrderId,
        status: this._status,
        percentage: this._percentage.value,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): AllocationSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      workOrderId: this._workOrderId,
      resourceId: this._resourceId,
      resourceType: this._resourceType,
      status: this._status,
      allocationPercentage: this._percentage.value,
      startDate: this.startDate,
      endDate: this.endDate,
      priority: this._priority.value,
      notes: this._notes.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: AllocationStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionAllocation(this._status, to)) {
      throw new InvalidAllocationStateError(
        `Cannot transition allocation from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._status === AllocationStatus.ARCHIVED) {
      throw new InvalidAllocationStateError(
        "Archived allocations are immutable.",
      );
    }
  }
}
