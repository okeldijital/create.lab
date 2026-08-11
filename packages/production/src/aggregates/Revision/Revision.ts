import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  RevisionStatus,
  canTransitionRevision,
} from "../../enums/RevisionStatus.js";
import { RevisionLifecycleError } from "../../errors/ProductionErrors.js";
import {
  RevisionClosed,
  RevisionCompleted,
  RevisionRequested,
  RevisionStarted,
} from "../../events/production-events.js";
import {
  asRevisionId,
  type ProductionId,
  type RevisionId,
} from "../../types/ids.js";
import { RevisionNumber } from "../../value-objects/RevisionNumber.js";
import { RevisionReason } from "../../value-objects/RevisionReason.js";

export type CreateRevisionProps = {
  organizationId: OrganizationId;
  productionId: ProductionId;
  requestedBy: string;
  revisionNumber: number;
  reason: string;
  id?: string;
  now?: Date;
};

export type RevisionSnapshot = {
  id: RevisionId;
  organizationId: OrganizationId;
  productionId: ProductionId;
  requestedBy: string;
  revisionNumber: number;
  reason: string;
  status: RevisionStatus;
  requestedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Revision request cycle on a production.
 * REQUESTED → IN_PROGRESS → COMPLETED → CLOSED.
 */
export class Revision extends AggregateRoot<RevisionId> {
  private constructor(
    id: RevisionId,
    private readonly _organizationId: OrganizationId,
    private readonly _productionId: ProductionId,
    private readonly _requestedBy: string,
    private readonly _revisionNumber: RevisionNumber,
    private readonly _reason: RevisionReason,
    private _status: RevisionStatus,
    private readonly _requestedAt: Date,
    private _completedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateRevisionProps): Revision {
    if (!props.productionId) {
      throw new RevisionLifecycleError("Revision requires a production.");
    }
    const requestedBy = props.requestedBy?.trim();
    if (!requestedBy) {
      throw new RevisionLifecycleError(
        "Revision requires requestedBy identity.",
      );
    }
    const now = props.now ?? new Date();
    const id = asRevisionId(props.id ?? generateId());
    const revision = new Revision(
      id,
      props.organizationId,
      props.productionId,
      requestedBy,
      RevisionNumber.create(props.revisionNumber),
      RevisionReason.create(props.reason),
      RevisionStatus.REQUESTED,
      now,
      null,
      now,
      now,
    );
    revision.record(
      RevisionRequested.create({
        organizationId: props.organizationId,
        revisionId: id,
        productionId: props.productionId,
        revisionNumber: props.revisionNumber,
        status: RevisionStatus.REQUESTED,
        occurredAt: now,
      }),
    );
    return revision;
  }

  static reconstitute(snapshot: RevisionSnapshot): Revision {
    return new Revision(
      snapshot.id,
      snapshot.organizationId,
      snapshot.productionId,
      snapshot.requestedBy,
      RevisionNumber.create(snapshot.revisionNumber),
      RevisionReason.create(snapshot.reason),
      snapshot.status,
      new Date(snapshot.requestedAt),
      snapshot.completedAt ? new Date(snapshot.completedAt) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get productionId(): ProductionId {
    return this._productionId;
  }
  get requestedBy(): string {
    return this._requestedBy;
  }
  get revisionNumber(): RevisionNumber {
    return this._revisionNumber;
  }
  get reason(): RevisionReason {
    return this._reason;
  }
  get status(): RevisionStatus {
    return this._status;
  }
  get requestedAt(): Date {
    return new Date(this._requestedAt);
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
    return this._status === RevisionStatus.CLOSED;
  }

  start(now: Date = new Date()): void {
    this.transitionTo(RevisionStatus.IN_PROGRESS, now);
    this.record(
      RevisionStarted.create({
        organizationId: this._organizationId,
        revisionId: this.id,
        productionId: this._productionId,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    this.transitionTo(RevisionStatus.COMPLETED, now);
    this._completedAt = now;
    this.record(
      RevisionCompleted.create({
        organizationId: this._organizationId,
        revisionId: this.id,
        productionId: this._productionId,
        occurredAt: now,
      }),
    );
  }

  close(now: Date = new Date()): void {
    this.transitionTo(RevisionStatus.CLOSED, now);
    this.record(
      RevisionClosed.create({
        organizationId: this._organizationId,
        revisionId: this.id,
        productionId: this._productionId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): RevisionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      productionId: this._productionId,
      requestedBy: this._requestedBy,
      revisionNumber: this._revisionNumber.value,
      reason: this._reason.value,
      status: this._status,
      requestedAt: this.requestedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: RevisionStatus, now: Date): void {
    if (this._status === RevisionStatus.CLOSED) {
      throw new RevisionLifecycleError("Closed revisions are immutable.");
    }
    if (
      this._status === RevisionStatus.COMPLETED &&
      to !== RevisionStatus.CLOSED
    ) {
      throw new RevisionLifecycleError(
        "Completed revisions are immutable except close.",
      );
    }
    if (!canTransitionRevision(this._status, to)) {
      throw new RevisionLifecycleError(
        `Cannot transition revision from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }
}
