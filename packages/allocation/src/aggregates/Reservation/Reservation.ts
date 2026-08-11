import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import {
  ReservationStatus,
  canTransitionReservation,
} from "../../enums/ReservationStatus.js";
import { ReservationLifecycleError } from "../../errors/AllocationErrors.js";
import {
  ReservationApproved,
  ReservationCancelled,
  ReservationConverted,
  ReservationRequested,
} from "../../events/allocation-events.js";
import {
  asReservationId,
  type AllocationId,
  type ReservationId,
} from "../../types/ids.js";
import { ReservationPeriod } from "../../value-objects/ReservationPeriod.js";

export type CreateReservationProps = {
  organizationId: OrganizationId;
  resourceId: string;
  projectId: ProjectId;
  requestedBy: string;
  reservedFrom: Date;
  reservedUntil: Date;
  id?: string;
  now?: Date;
};

export type ReservationSnapshot = {
  id: ReservationId;
  organizationId: OrganizationId;
  resourceId: string;
  projectId: ProjectId;
  requestedBy: string;
  reservedFrom: Date;
  reservedUntil: Date;
  status: ReservationStatus;
  convertedAllocationId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Future commitment hold before formal Allocation.
 * Reservation becomes Allocation — never becomes work.
 */
export class Reservation extends AggregateRoot<ReservationId> {
  private constructor(
    id: ReservationId,
    private readonly _organizationId: OrganizationId,
    private readonly _resourceId: string,
    private readonly _projectId: ProjectId,
    private readonly _requestedBy: string,
    private readonly _period: ReservationPeriod,
    private _status: ReservationStatus,
    private _convertedAllocationId: AllocationId | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateReservationProps): Reservation {
    if (!props.resourceId) {
      throw new ReservationLifecycleError("Reservation requires a resource.");
    }
    if (!props.projectId) {
      throw new ReservationLifecycleError("Reservation requires a project.");
    }
    const requestedBy = props.requestedBy?.trim();
    if (!requestedBy) {
      throw new ReservationLifecycleError(
        "Reservation requires requestedBy identity.",
      );
    }
    const period = ReservationPeriod.create(
      props.reservedFrom,
      props.reservedUntil,
    );
    const now = props.now ?? new Date();
    const id = asReservationId(props.id ?? generateId());
    const reservation = new Reservation(
      id,
      props.organizationId,
      String(props.resourceId),
      props.projectId,
      requestedBy,
      period,
      ReservationStatus.REQUESTED,
      null,
      now,
      now,
    );
    reservation.record(
      ReservationRequested.create({
        organizationId: props.organizationId,
        reservationId: id,
        resourceId: reservation._resourceId,
        projectId: props.projectId,
        status: ReservationStatus.REQUESTED,
        occurredAt: now,
      }),
    );
    return reservation;
  }

  static reconstitute(snapshot: ReservationSnapshot): Reservation {
    return new Reservation(
      snapshot.id,
      snapshot.organizationId,
      snapshot.resourceId,
      snapshot.projectId,
      snapshot.requestedBy,
      ReservationPeriod.create(snapshot.reservedFrom, snapshot.reservedUntil),
      snapshot.status,
      snapshot.convertedAllocationId
        ? (snapshot.convertedAllocationId as AllocationId)
        : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get resourceId(): string {
    return this._resourceId;
  }
  get projectId(): ProjectId {
    return this._projectId;
  }
  get requestedBy(): string {
    return this._requestedBy;
  }
  get reservedFrom(): Date {
    return this._period.from;
  }
  get reservedUntil(): Date {
    return this._period.until;
  }
  get period(): ReservationPeriod {
    return this._period;
  }
  get status(): ReservationStatus {
    return this._status;
  }
  get convertedAllocationId(): AllocationId | null {
    return this._convertedAllocationId;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isTerminal(): boolean {
    return (
      this._status === ReservationStatus.CONVERTED ||
      this._status === ReservationStatus.CANCELLED
    );
  }

  approve(now: Date = new Date()): void {
    this.transitionTo(ReservationStatus.APPROVED, now);
    this.record(
      ReservationApproved.create({
        organizationId: this._organizationId,
        reservationId: this.id,
        occurredAt: now,
      }),
    );
  }

  cancel(now: Date = new Date()): void {
    this.transitionTo(ReservationStatus.CANCELLED, now);
    this.record(
      ReservationCancelled.create({
        organizationId: this._organizationId,
        reservationId: this.id,
        occurredAt: now,
      }),
    );
  }

  /**
   * Mark converted and link allocation id. Caller creates Allocation and publishes both events.
   */
  convert(allocationId: AllocationId, now: Date = new Date()): void {
    this.transitionTo(ReservationStatus.CONVERTED, now);
    this._convertedAllocationId = allocationId;
    this.record(
      ReservationConverted.create({
        organizationId: this._organizationId,
        reservationId: this.id,
        allocationId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ReservationSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      resourceId: this._resourceId,
      projectId: this._projectId,
      requestedBy: this._requestedBy,
      reservedFrom: this.reservedFrom,
      reservedUntil: this.reservedUntil,
      status: this._status,
      convertedAllocationId: this._convertedAllocationId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: ReservationStatus, now: Date): void {
    if (!canTransitionReservation(this._status, to)) {
      throw new ReservationLifecycleError(
        `Cannot transition reservation from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }
}
