import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import {
  OpportunityStatus,
  canTransitionOpportunity,
} from "../../enums/OpportunityStatus.js";
import { InvalidOpportunityStateError } from "../../errors/CRMErrors.js";
import {
  OpportunityArchived,
  OpportunityCreated,
  OpportunityLost,
  OpportunityWon,
} from "../../events/crm-events.js";
import {
  asOpportunityId,
  type CustomerId,
  type OpportunityId,
} from "../../types/ids.js";
import { OpportunityTitle } from "../../value-objects/OpportunityTitle.js";
import { OpportunityValue } from "../../value-objects/OpportunityValue.js";
import { Probability } from "../../value-objects/Probability.js";

export type CreateOpportunityProps = {
  organizationId: OrganizationId;
  customerId: CustomerId;
  title: string;
  estimatedValueMinor?: number;
  probability?: number;
  expectedCloseDate?: Date | null;
  projectId?: ProjectId | null;
  id?: string;
  now?: Date;
};

export type OpportunitySnapshot = {
  id: OpportunityId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  title: string;
  estimatedValueMinor: number;
  probability: number;
  expectedCloseDate: Date | null;
  projectId: string | null;
  status: OpportunityStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Potential work. Progresses OPEN → … → WON/LOST → ARCHIVED.
 */
export class Opportunity extends AggregateRoot<OpportunityId> {
  private constructor(
    id: OpportunityId,
    private readonly _organizationId: OrganizationId,
    private readonly _customerId: CustomerId,
    private _title: OpportunityTitle,
    private _estimatedValue: OpportunityValue,
    private _probability: Probability,
    private _expectedCloseDate: Date | null,
    private readonly _projectId: ProjectId | null,
    private _status: OpportunityStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateOpportunityProps): Opportunity {
    if (!props.customerId) {
      throw new InvalidOpportunityStateError(
        "Opportunity requires a customer.",
      );
    }
    const now = props.now ?? new Date();
    const id = asOpportunityId(props.id ?? generateId());
    const opportunity = new Opportunity(
      id,
      props.organizationId,
      props.customerId,
      OpportunityTitle.create(props.title),
      OpportunityValue.fromMinorUnits(props.estimatedValueMinor ?? 0),
      Probability.create(props.probability ?? 0),
      props.expectedCloseDate ? new Date(props.expectedCloseDate) : null,
      props.projectId ?? null,
      OpportunityStatus.OPEN,
      now,
      now,
      null,
    );
    opportunity.record(
      OpportunityCreated.create({
        organizationId: props.organizationId,
        opportunityId: id,
        customerId: props.customerId,
        title: opportunity.title.value,
        status: OpportunityStatus.OPEN,
        occurredAt: now,
      }),
    );
    return opportunity;
  }

  static reconstitute(snapshot: OpportunitySnapshot): Opportunity {
    return new Opportunity(
      snapshot.id,
      snapshot.organizationId,
      snapshot.customerId,
      OpportunityTitle.create(snapshot.title),
      OpportunityValue.fromMinorUnits(snapshot.estimatedValueMinor),
      Probability.create(snapshot.probability),
      snapshot.expectedCloseDate
        ? new Date(snapshot.expectedCloseDate)
        : null,
      (snapshot.projectId as ProjectId | null) ?? null,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get customerId(): CustomerId {
    return this._customerId;
  }
  get title(): OpportunityTitle {
    return this._title;
  }
  get estimatedValue(): OpportunityValue {
    return this._estimatedValue;
  }
  get probability(): Probability {
    return this._probability;
  }
  get expectedCloseDate(): Date | null {
    return this._expectedCloseDate
      ? new Date(this._expectedCloseDate)
      : null;
  }
  get projectId(): ProjectId | null {
    return this._projectId;
  }
  get status(): OpportunityStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get archivedAt(): Date | null {
    return this._archivedAt ? new Date(this._archivedAt) : null;
  }
  get isArchived(): boolean {
    return this._status === OpportunityStatus.ARCHIVED;
  }
  get isWon(): boolean {
    return this._status === OpportunityStatus.WON;
  }
  get isLost(): boolean {
    return this._status === OpportunityStatus.LOST;
  }

  qualify(now: Date = new Date()): void {
    this.transitionTo(OpportunityStatus.QUALIFIED, now);
  }

  propose(now: Date = new Date()): void {
    this.transitionTo(OpportunityStatus.PROPOSAL, now);
  }

  negotiate(now: Date = new Date()): void {
    this.transitionTo(OpportunityStatus.NEGOTIATION, now);
  }

  win(now: Date = new Date()): void {
    this.transitionTo(OpportunityStatus.WON, now);
    this._probability = Probability.create(100);
    this.record(
      OpportunityWon.create({
        organizationId: this._organizationId,
        opportunityId: this.id,
        customerId: this._customerId,
        occurredAt: now,
      }),
    );
  }

  lose(now: Date = new Date()): void {
    this.transitionTo(OpportunityStatus.LOST, now);
    this._probability = Probability.create(0);
    this.record(
      OpportunityLost.create({
        organizationId: this._organizationId,
        opportunityId: this.id,
        customerId: this._customerId,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === OpportunityStatus.ARCHIVED) {
      throw new InvalidOpportunityStateError(
        "Opportunity already archived.",
      );
    }
    this.transitionTo(OpportunityStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      OpportunityArchived.create({
        organizationId: this._organizationId,
        opportunityId: this.id,
        occurredAt: now,
      }),
    );
  }

  updateEstimate(
    estimatedValueMinor: number,
    probability: number,
    now: Date = new Date(),
  ): void {
    this.assertOpenPipeline();
    this._estimatedValue = OpportunityValue.fromMinorUnits(estimatedValueMinor);
    this._probability = Probability.create(probability);
    this._updatedAt = now;
  }

  toSnapshot(): OpportunitySnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      customerId: this._customerId,
      title: this._title.value,
      estimatedValueMinor: this._estimatedValue.minorUnits,
      probability: this._probability.value,
      expectedCloseDate: this.expectedCloseDate,
      projectId: this._projectId,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: OpportunityStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionOpportunity(this._status, to)) {
      throw new InvalidOpportunityStateError(
        `Cannot transition opportunity from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertOpenPipeline(): void {
    this.assertMutable();
    if (
      this._status === OpportunityStatus.WON ||
      this._status === OpportunityStatus.LOST
    ) {
      throw new InvalidOpportunityStateError(
        "Closed opportunities cannot be estimated.",
      );
    }
  }

  private assertMutable(): void {
    if (this._status === OpportunityStatus.ARCHIVED) {
      throw new InvalidOpportunityStateError(
        "Archived opportunities are immutable.",
      );
    }
  }
}
