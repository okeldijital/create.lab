import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  DeliverableStatus,
  canTransitionDeliverable,
} from "../../enums/DeliverableStatus.js";
import {
  DeliverableAlreadyAcceptedError,
  InvalidEngagementStateError,
} from "../../errors/EngagementErrors.js";
import {
  DeliverableAccepted,
  DeliverableCompleted,
  DeliverableCreated,
} from "../../events/engagement-events.js";
import {
  asDeliverableId,
  type DeliverableId,
  type EngagementId,
} from "../../types/ids.js";
import { DeliverableTitle } from "../../value-objects/DeliverableTitle.js";
import { EngagementDescription } from "../../value-objects/EngagementDescription.js";
import { SequenceNumber } from "../../value-objects/SequenceNumber.js";

export type CreateDeliverableProps = {
  organizationId: OrganizationId;
  engagementId: EngagementId;
  title: string;
  description?: string | null;
  sequence: number;
  id?: string;
  now?: Date;
};

export type DeliverableSnapshot = {
  id: DeliverableId;
  organizationId: OrganizationId;
  engagementId: EngagementId;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Deliverable extends AggregateRoot<DeliverableId> {
  private constructor(
    id: DeliverableId,
    private readonly _organizationId: OrganizationId,
    private readonly _engagementId: EngagementId,
    private readonly _title: DeliverableTitle,
    private readonly _description: EngagementDescription,
    private _status: DeliverableStatus,
    private _sequence: SequenceNumber,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateDeliverableProps): Deliverable {
    if (!props.engagementId) {
      throw new InvalidEngagementStateError(
        "Deliverable requires an engagement.",
      );
    }
    const now = props.now ?? new Date();
    const id = asDeliverableId(props.id ?? generateId());
    const d = new Deliverable(
      id,
      props.organizationId,
      props.engagementId,
      DeliverableTitle.create(props.title),
      EngagementDescription.create(props.description),
      DeliverableStatus.PLANNED,
      SequenceNumber.create(props.sequence),
      now,
      now,
    );
    d.record(
      DeliverableCreated.create({
        organizationId: props.organizationId,
        deliverableId: id,
        engagementId: props.engagementId,
        title: d.title.value,
        sequence: d.sequence,
        occurredAt: now,
      }),
    );
    return d;
  }

  static reconstitute(snapshot: DeliverableSnapshot): Deliverable {
    return new Deliverable(
      snapshot.id,
      snapshot.organizationId,
      snapshot.engagementId,
      DeliverableTitle.create(snapshot.title),
      EngagementDescription.create(snapshot.description),
      snapshot.status,
      SequenceNumber.create(snapshot.sequence),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get engagementId(): EngagementId {
    return this._engagementId;
  }
  get title(): DeliverableTitle {
    return this._title;
  }
  get description(): EngagementDescription {
    return this._description;
  }
  get status(): DeliverableStatus {
    return this._status;
  }
  get sequence(): number {
    return this._sequence.value;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isAccepted(): boolean {
    return this._status === DeliverableStatus.ACCEPTED;
  }

  setSequence(sequence: number, now: Date = new Date()): void {
    this.assertMutable();
    this._sequence = SequenceNumber.create(sequence);
    this._updatedAt = now;
  }

  start(now: Date = new Date()): void {
    this.transitionTo(DeliverableStatus.IN_PROGRESS, now);
  }

  complete(now: Date = new Date()): void {
    this.transitionTo(DeliverableStatus.COMPLETED, now);
    this.record(
      DeliverableCompleted.create({
        organizationId: this._organizationId,
        deliverableId: this.id,
        engagementId: this._engagementId,
        occurredAt: now,
      }),
    );
  }

  accept(now: Date = new Date()): void {
    if (this._status === DeliverableStatus.ACCEPTED) {
      throw new DeliverableAlreadyAcceptedError(this.id);
    }
    this.transitionTo(DeliverableStatus.ACCEPTED, now);
    this.record(
      DeliverableAccepted.create({
        organizationId: this._organizationId,
        deliverableId: this.id,
        engagementId: this._engagementId,
        status: DeliverableStatus.ACCEPTED,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): DeliverableSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      engagementId: this._engagementId,
      title: this._title.value,
      description: this._description.value,
      status: this._status,
      sequence: this._sequence.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: DeliverableStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionDeliverable(this._status, to)) {
      throw new InvalidEngagementStateError(
        `Cannot transition deliverable from ${this._status} to ${to}.`,
      );
    }
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._status === DeliverableStatus.ACCEPTED) {
      throw new DeliverableAlreadyAcceptedError(this.id);
    }
  }
}
