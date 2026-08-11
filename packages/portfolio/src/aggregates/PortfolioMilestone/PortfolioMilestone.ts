import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  MilestoneStatus,
  canTransitionMilestone,
} from "../../enums/MilestoneStatus.js";
import { InvalidPortfolioStateError } from "../../errors/PortfolioErrors.js";
import {
  PortfolioMilestoneActivated,
  PortfolioMilestoneCompleted,
  PortfolioMilestoneCreated,
} from "../../events/portfolio-events.js";
import {
  asPortfolioMilestoneId,
  type PortfolioId,
  type PortfolioMilestoneId,
} from "../../types/ids.js";
import { MilestoneTitle } from "../../value-objects/MilestoneTitle.js";
import { SequenceNumber } from "../../value-objects/SequenceNumber.js";

export type CreatePortfolioMilestoneProps = {
  organizationId: OrganizationId;
  portfolioId: PortfolioId;
  title: string;
  targetDate: Date;
  sequence: number;
  id?: string;
  now?: Date;
};

export type PortfolioMilestoneSnapshot = {
  id: PortfolioMilestoneId;
  organizationId: OrganizationId;
  portfolioId: PortfolioId;
  title: string;
  targetDate: Date;
  status: MilestoneStatus;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
};

export class PortfolioMilestone extends AggregateRoot<PortfolioMilestoneId> {
  private constructor(
    id: PortfolioMilestoneId,
    private readonly _organizationId: OrganizationId,
    private readonly _portfolioId: PortfolioId,
    private readonly _title: MilestoneTitle,
    private readonly _targetDate: Date,
    private _status: MilestoneStatus,
    private readonly _sequence: SequenceNumber,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreatePortfolioMilestoneProps): PortfolioMilestone {
    if (!props.portfolioId) {
      throw new InvalidPortfolioStateError(
        "Milestone requires a portfolio.",
      );
    }
    const targetDate = new Date(props.targetDate);
    if (Number.isNaN(targetDate.getTime())) {
      throw new InvalidPortfolioStateError("Invalid target date.");
    }
    const now = props.now ?? new Date();
    const id = asPortfolioMilestoneId(props.id ?? generateId());
    const m = new PortfolioMilestone(
      id,
      props.organizationId,
      props.portfolioId,
      MilestoneTitle.create(props.title),
      targetDate,
      MilestoneStatus.PLANNED,
      SequenceNumber.create(props.sequence),
      now,
      now,
    );
    m.record(
      PortfolioMilestoneCreated.create({
        organizationId: props.organizationId,
        milestoneId: id,
        portfolioId: props.portfolioId,
        title: m.title.value,
        sequence: m.sequence,
        occurredAt: now,
      }),
    );
    return m;
  }

  static reconstitute(
    snapshot: PortfolioMilestoneSnapshot,
  ): PortfolioMilestone {
    return new PortfolioMilestone(
      snapshot.id,
      snapshot.organizationId,
      snapshot.portfolioId,
      MilestoneTitle.create(snapshot.title),
      new Date(snapshot.targetDate),
      snapshot.status,
      SequenceNumber.create(snapshot.sequence),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get portfolioId(): PortfolioId {
    return this._portfolioId;
  }
  get title(): MilestoneTitle {
    return this._title;
  }
  get targetDate(): Date {
    return new Date(this._targetDate);
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
      PortfolioMilestoneActivated.create({
        organizationId: this._organizationId,
        milestoneId: this.id,
        portfolioId: this._portfolioId,
        status: MilestoneStatus.ACTIVE,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    this.transitionTo(MilestoneStatus.COMPLETED, now);
    this.record(
      PortfolioMilestoneCompleted.create({
        organizationId: this._organizationId,
        milestoneId: this.id,
        portfolioId: this._portfolioId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): PortfolioMilestoneSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      portfolioId: this._portfolioId,
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
      throw new InvalidPortfolioStateError(
        "Completed milestones are immutable.",
      );
    }
    if (!canTransitionMilestone(this._status, to)) {
      throw new InvalidPortfolioStateError(
        `Cannot transition milestone from ${this._status} to ${to}.`,
      );
    }
    this._status = to;
    this._updatedAt = now;
  }
}
