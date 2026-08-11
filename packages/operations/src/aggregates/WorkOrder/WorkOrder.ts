import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { AllocationId } from "../../types/ids.js";
import type { BookingId } from "@creative-lab/scheduling";
import {
  WorkOrderStatus,
  canTransitionWorkOrder,
} from "../../enums/WorkOrderStatus.js";
import type { WorkPriority } from "../../enums/WorkPriority.js";
import { InvalidWorkStateError } from "../../errors/OperationsErrors.js";
import {
  WorkClosed,
  WorkCompleted,
  WorkOrderCreated,
  WorkPaused,
  WorkStarted,
} from "../../events/operations-events.js";
import { asWorkOrderId, type WorkOrderId } from "../../types/ids.js";
import { Priority } from "../../value-objects/Priority.js";
import { WorkDescription } from "../../value-objects/WorkDescription.js";
import { WorkTitle } from "../../value-objects/WorkTitle.js";

export type CreateWorkOrderProps = {
  organizationId: OrganizationId;
  allocationId: AllocationId;
  bookingId: BookingId;
  title: string;
  description?: string | null;
  priority?: WorkPriority;
  plannedStart: Date;
  plannedEnd: Date;
  id?: string;
  now?: Date;
};

export type WorkOrderSnapshot = {
  id: WorkOrderId;
  organizationId: OrganizationId;
  allocationId: AllocationId;
  bookingId: BookingId;
  title: string;
  description: string | null;
  priority: WorkPriority;
  status: WorkOrderStatus;
  plannedStart: Date;
  plannedEnd: Date;
  actualStart: Date | null;
  actualEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
};

/**
 * Aggregate root: operational execution of allocated work.
 * Planning ends; execution begins. References Allocation/Booking without owning them.
 */
export class WorkOrder extends AggregateRoot<WorkOrderId> {
  private constructor(
    id: WorkOrderId,
    private readonly _organizationId: OrganizationId,
    private readonly _allocationId: AllocationId,
    private readonly _bookingId: BookingId,
    private _title: WorkTitle,
    private _description: WorkDescription,
    private _priority: Priority,
    private _status: WorkOrderStatus,
    private readonly _plannedStart: Date,
    private readonly _plannedEnd: Date,
    private _actualStart: Date | null,
    private _actualEnd: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _closedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateWorkOrderProps): WorkOrder {
    if (!props.allocationId) {
      throw new InvalidWorkStateError("Work order requires an allocation.");
    }
    if (!props.bookingId) {
      throw new InvalidWorkStateError("Work order requires a booking.");
    }
    const plannedStart = new Date(props.plannedStart);
    const plannedEnd = new Date(props.plannedEnd);
    if (
      Number.isNaN(plannedStart.getTime()) ||
      Number.isNaN(plannedEnd.getTime())
    ) {
      throw new InvalidWorkStateError("Planned start/end must be valid dates.");
    }
    if (plannedEnd.getTime() <= plannedStart.getTime()) {
      throw new InvalidWorkStateError(
        "Planned end must be after planned start.",
      );
    }

    const now = props.now ?? new Date();
    const id = asWorkOrderId(props.id ?? generateId());
    const order = new WorkOrder(
      id,
      props.organizationId,
      props.allocationId,
      props.bookingId,
      WorkTitle.create(props.title),
      WorkDescription.create(props.description),
      Priority.create(props.priority),
      WorkOrderStatus.CREATED,
      plannedStart,
      plannedEnd,
      null,
      null,
      now,
      now,
      null,
    );
    order.record(
      WorkOrderCreated.create({
        organizationId: props.organizationId,
        workOrderId: id,
        allocationId: props.allocationId,
        bookingId: props.bookingId,
        title: order._title.value,
        status: WorkOrderStatus.CREATED,
        occurredAt: now,
      }),
    );
    return order;
  }

  static reconstitute(snapshot: WorkOrderSnapshot): WorkOrder {
    return new WorkOrder(
      snapshot.id,
      snapshot.organizationId,
      snapshot.allocationId,
      snapshot.bookingId,
      WorkTitle.create(snapshot.title),
      WorkDescription.create(snapshot.description),
      Priority.create(snapshot.priority),
      snapshot.status,
      new Date(snapshot.plannedStart),
      new Date(snapshot.plannedEnd),
      snapshot.actualStart ? new Date(snapshot.actualStart) : null,
      snapshot.actualEnd ? new Date(snapshot.actualEnd) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.closedAt ? new Date(snapshot.closedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get allocationId(): AllocationId {
    return this._allocationId;
  }
  get bookingId(): BookingId {
    return this._bookingId;
  }
  get title(): WorkTitle {
    return this._title;
  }
  get description(): WorkDescription {
    return this._description;
  }
  get priority(): Priority {
    return this._priority;
  }
  get status(): WorkOrderStatus {
    return this._status;
  }
  get plannedStart(): Date {
    return new Date(this._plannedStart);
  }
  get plannedEnd(): Date {
    return new Date(this._plannedEnd);
  }
  get actualStart(): Date | null {
    return this._actualStart ? new Date(this._actualStart) : null;
  }
  get actualEnd(): Date | null {
    return this._actualEnd ? new Date(this._actualEnd) : null;
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
  get isActive(): boolean {
    return (
      this._status === WorkOrderStatus.READY ||
      this._status === WorkOrderStatus.IN_PROGRESS ||
      this._status === WorkOrderStatus.PAUSED
    );
  }
  get isClosed(): boolean {
    return this._status === WorkOrderStatus.CLOSED;
  }
  get isTerminal(): boolean {
    return (
      this._status === WorkOrderStatus.CLOSED ||
      this._status === WorkOrderStatus.CANCELLED ||
      this._status === WorkOrderStatus.COMPLETED
    );
  }

  markReady(now: Date = new Date()): void {
    this.transitionTo(WorkOrderStatus.READY, now);
  }

  start(now: Date = new Date()): void {
    this.assertNotClosed();
    this.transitionTo(WorkOrderStatus.IN_PROGRESS, now);
    if (!this._actualStart) {
      this._actualStart = now;
    }
    this.record(
      WorkStarted.create({
        organizationId: this._organizationId,
        workOrderId: this.id,
        actualStart: this._actualStart,
        occurredAt: now,
      }),
    );
  }

  pause(now: Date = new Date()): void {
    this.assertNotClosed();
    this.transitionTo(WorkOrderStatus.PAUSED, now);
    this.record(
      WorkPaused.create({
        organizationId: this._organizationId,
        workOrderId: this.id,
        occurredAt: now,
      }),
    );
  }

  resume(now: Date = new Date()): void {
    this.assertNotClosed();
    this.transitionTo(WorkOrderStatus.IN_PROGRESS, now);
    this.record(
      WorkStarted.create({
        organizationId: this._organizationId,
        workOrderId: this.id,
        actualStart: this._actualStart ?? now,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    this.assertNotClosed();
    if (!this._actualStart) {
      throw new InvalidWorkStateError(
        "Cannot complete work order before it has been started.",
      );
    }
    if (now.getTime() <= this._actualStart.getTime()) {
      throw new InvalidWorkStateError(
        "Actual end must be after actual start.",
      );
    }
    this.transitionTo(WorkOrderStatus.COMPLETED, now);
    this._actualEnd = now;
    this.record(
      WorkCompleted.create({
        organizationId: this._organizationId,
        workOrderId: this.id,
        actualEnd: now,
        occurredAt: now,
      }),
    );
  }

  cancel(now: Date = new Date()): void {
    this.assertNotClosed();
    this.transitionTo(WorkOrderStatus.CANCELLED, now);
  }

  close(now: Date = new Date()): void {
    this.assertNotClosed();
    this.transitionTo(WorkOrderStatus.CLOSED, now);
    this._closedAt = now;
    this.record(
      WorkClosed.create({
        organizationId: this._organizationId,
        workOrderId: this.id,
        closedAt: now,
        occurredAt: now,
      }),
    );
  }

  updateDetails(props: {
    title?: string;
    description?: string | null;
    priority?: WorkPriority;
    now?: Date;
  }): void {
    this.assertMutable();
    const now = props.now ?? new Date();
    if (props.title !== undefined) {
      this._title = WorkTitle.create(props.title);
    }
    if (props.description !== undefined) {
      this._description = WorkDescription.create(props.description);
    }
    if (props.priority !== undefined) {
      this._priority = Priority.create(props.priority);
    }
    this._updatedAt = now;
  }

  toSnapshot(): WorkOrderSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      allocationId: this._allocationId,
      bookingId: this._bookingId,
      title: this._title.value,
      description: this._description.value,
      priority: this._priority.value,
      status: this._status,
      plannedStart: this.plannedStart,
      plannedEnd: this.plannedEnd,
      actualStart: this.actualStart,
      actualEnd: this.actualEnd,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      closedAt: this.closedAt,
    };
  }

  private transitionTo(to: WorkOrderStatus, now: Date): void {
    if (!canTransitionWorkOrder(this._status, to)) {
      throw new InvalidWorkStateError(
        `Cannot transition work order from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertNotClosed(): void {
    if (this._status === WorkOrderStatus.CLOSED) {
      throw new InvalidWorkStateError(
        "Closed work orders cannot be reopened or modified.",
      );
    }
  }

  private assertMutable(): void {
    this.assertNotClosed();
    if (
      this._status === WorkOrderStatus.COMPLETED ||
      this._status === WorkOrderStatus.CANCELLED
    ) {
      throw new InvalidWorkStateError(
        `Work order in status ${this._status} cannot be updated.`,
      );
    }
  }
}
