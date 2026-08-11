import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ObligationParty } from "../../enums/ObligationParty.js";
import { ObligationStatus } from "../../enums/ObligationStatus.js";
import {
  InvalidEngagementStateError,
  ObligationAlreadyFulfilledError,
} from "../../errors/EngagementErrors.js";
import {
  ObligationCreated,
  ObligationFulfilled,
  ObligationWaived,
} from "../../events/engagement-events.js";
import {
  asObligationId,
  type EngagementId,
  type ObligationId,
} from "../../types/ids.js";
import { EngagementDescription } from "../../value-objects/EngagementDescription.js";
import { ObligationTitle } from "../../value-objects/ObligationTitle.js";

export type CreateObligationProps = {
  organizationId: OrganizationId;
  engagementId: EngagementId;
  party: ObligationParty;
  title: string;
  description?: string | null;
  id?: string;
  now?: Date;
};

export type ObligationSnapshot = {
  id: ObligationId;
  organizationId: OrganizationId;
  engagementId: EngagementId;
  party: ObligationParty;
  title: string;
  description: string | null;
  status: ObligationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class Obligation extends AggregateRoot<ObligationId> {
  private constructor(
    id: ObligationId,
    private readonly _organizationId: OrganizationId,
    private readonly _engagementId: EngagementId,
    private readonly _party: ObligationParty,
    private readonly _title: ObligationTitle,
    private readonly _description: EngagementDescription,
    private _status: ObligationStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateObligationProps): Obligation {
    if (!props.engagementId) {
      throw new InvalidEngagementStateError(
        "Obligation requires an engagement.",
      );
    }
    if (!Object.values(ObligationParty).includes(props.party)) {
      throw new InvalidEngagementStateError(
        `Invalid obligation party: ${String(props.party)}`,
      );
    }
    const now = props.now ?? new Date();
    const id = asObligationId(props.id ?? generateId());
    const o = new Obligation(
      id,
      props.organizationId,
      props.engagementId,
      props.party,
      ObligationTitle.create(props.title),
      EngagementDescription.create(props.description),
      ObligationStatus.PENDING,
      now,
      now,
    );
    o.record(
      ObligationCreated.create({
        organizationId: props.organizationId,
        obligationId: id,
        engagementId: props.engagementId,
        title: o.title.value,
        status: ObligationStatus.PENDING,
        occurredAt: now,
      }),
    );
    return o;
  }

  static reconstitute(snapshot: ObligationSnapshot): Obligation {
    return new Obligation(
      snapshot.id,
      snapshot.organizationId,
      snapshot.engagementId,
      snapshot.party,
      ObligationTitle.create(snapshot.title),
      EngagementDescription.create(snapshot.description),
      snapshot.status,
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
  get party(): ObligationParty {
    return this._party;
  }
  get title(): ObligationTitle {
    return this._title;
  }
  get description(): EngagementDescription {
    return this._description;
  }
  get status(): ObligationStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isTerminal(): boolean {
    return (
      this._status === ObligationStatus.FULFILLED ||
      this._status === ObligationStatus.WAIVED
    );
  }

  fulfill(now: Date = new Date()): void {
    this.assertPending();
    this._status = ObligationStatus.FULFILLED;
    this._updatedAt = now;
    this.record(
      ObligationFulfilled.create({
        organizationId: this._organizationId,
        obligationId: this.id,
        engagementId: this._engagementId,
        occurredAt: now,
      }),
    );
  }

  waive(now: Date = new Date()): void {
    this.assertPending();
    this._status = ObligationStatus.WAIVED;
    this._updatedAt = now;
    this.record(
      ObligationWaived.create({
        organizationId: this._organizationId,
        obligationId: this.id,
        engagementId: this._engagementId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ObligationSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      engagementId: this._engagementId,
      party: this._party,
      title: this._title.value,
      description: this._description.value,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertPending(): void {
    if (this._status !== ObligationStatus.PENDING) {
      throw new ObligationAlreadyFulfilledError(this.id);
    }
  }
}
