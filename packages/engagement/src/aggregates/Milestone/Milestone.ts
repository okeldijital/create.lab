import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  MilestoneStatus,
  canTransitionMilestone,
} from "../../enums/MilestoneStatus.js";
import { InvalidEngagementStateError } from "../../errors/EngagementErrors.js";
import {
  MilestoneActivated,
  MilestoneCompleted,
  MilestoneCreated,
} from "../../events/engagement-events.js";
import {
  asMilestoneId,
  type EngagementId,
  type MilestoneId,
} from "../../types/ids.js";
import { MilestoneTitle } from "../../value-objects/MilestoneTitle.js";
import { SequenceNumber } from "../../value-objects/SequenceNumber.js";
import { TargetDate } from "../../value-objects/TargetDate.js";

export type CreateMilestoneProps = {
  organizationId: OrganizationId;
  engagementId: EngagementId;
  title: string;
  targetDate: Date;
  sequence: number;
  id?: string;
  now?: Date;
};

export type MilestoneSnapshot = {
  id: MilestoneId;
  organizationId: OrganizationId;
  engagementId: EngagementId;
  title: string;
  targetDate: Date;
  status: MilestoneStatus;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Milestone extends AggregateRoot<MilestoneId> {
  private constructor(
    id: MilestoneId,
    private readonly _organizationId: OrganizationId,
    private readonly _engagementId: EngagementId,
    private readonly _title: MilestoneTitle,
    private readonly _targetDate: TargetDate,
    private _status: MilestoneStatus,
    private readonly _sequence: SequenceNumber,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateMilestoneProps): Milestone {
    if (!props.engagementId) {
      throw new InvalidEngagementStateError(
        "Milestone requires an engagement.",
      );
    }
    const now = props.now ?? new Date();
    const id = asMilestoneId(props.id ?? generateId());
    const m = new Milestone(
      id,
      props.organizationId,
      props.engagementId,
      MilestoneTitle.create(props.title),
      TargetDate.create(props.targetDate),
      MilestoneStatus.PLANNED,
      SequenceNumber.create(props.sequence),
      now,
      now,
    );
    m.record(
      MilestoneCreated.create({
        organizationId: props.organizationId,
        milestoneId: id,
        engagementId: props.engagementId,
        title: m.title.value,
        sequence: m.sequence,
        occurredAt: now,
      }),
    );
    return m;
  }

  static reconstitute(snapshot: MilestoneSnapshot): Milestone {
    return new Milestone(
      snapshot.id,
      snapshot.organizationId,
      snapshot.engagementId,
      MilestoneTitle.create(snapshot.title),
      TargetDate.create(snapshot.targetDate),
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
  get title(): MilestoneTitle {
    return this._title;
  }
  get targetDate(): Date {
    return this._targetDate.value;
  }
  get status(): MilestoneStatus {
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
  get isActive(): boolean {
    return this._status === MilestoneStatus.ACTIVE;
  }
  get isCompleted(): boolean {
    return this._status === MilestoneStatus.COMPLETED;
  }

  activate(now: Date = new Date()): void {
    this.transitionTo(MilestoneStatus.ACTIVE, now);
    this.record(
      MilestoneActivated.create({
        organizationId: this._organizationId,
        milestoneId: this.id,
        engagementId: this._engagementId,
        status: MilestoneStatus.ACTIVE,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    this.transitionTo(MilestoneStatus.COMPLETED, now);
    this.record(
      MilestoneCompleted.create({
        organizationId: this._organizationId,
        milestoneId: this.id,
        engagementId: this._engagementId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): MilestoneSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      engagementId: this._engagementId,
      title: this._title.value,
      targetDate: this.targetDate,
      status: this._status,
      sequence: this._sequence.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: MilestoneStatus, now: Date): void {
    if (this._status === MilestoneStatus.COMPLETED) {
      throw new InvalidEngagementStateError(
        "Completed milestones are immutable.",
      );
    }
    if (!canTransitionMilestone(this._status, to)) {
      throw new InvalidEngagementStateError(
        `Cannot transition milestone from ${this._status} to ${to}.`,
      );
    }
    this._status = to;
    this._updatedAt = now;
  }
}
