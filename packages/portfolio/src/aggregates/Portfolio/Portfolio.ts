import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  PortfolioStatus,
  canTransitionPortfolio,
} from "../../enums/PortfolioStatus.js";
import { InvalidPortfolioStateError } from "../../errors/PortfolioErrors.js";
import {
  PortfolioActivated,
  PortfolioArchived,
  PortfolioCancelled,
  PortfolioCompleted,
  PortfolioCreated,
  PortfolioHeld,
} from "../../events/portfolio-events.js";
import {
  asPortfolioId,
  type InitiativeId,
  type PortfolioId,
  type ProgramId,
} from "../../types/ids.js";
import { PortfolioDescription } from "../../value-objects/PortfolioDescription.js";
import { PortfolioName } from "../../value-objects/PortfolioName.js";
import { PortfolioNumber } from "../../value-objects/PortfolioNumber.js";

export type CreatePortfolioProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  portfolioNumber?: string;
  startDate: Date;
  targetEndDate?: Date | null;
  id?: string;
  now?: Date;
};

export type PortfolioSnapshot = {
  id: PortfolioId;
  organizationId: OrganizationId;
  portfolioNumber: string;
  name: string;
  description: string | null;
  status: PortfolioStatus;
  startDate: Date;
  targetEndDate: Date | null;
  completedDate: Date | null;
  programIds: string[];
  initiativeIds: string[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export class Portfolio extends AggregateRoot<PortfolioId> {
  private constructor(
    id: PortfolioId,
    private readonly _organizationId: OrganizationId,
    private readonly _portfolioNumber: PortfolioNumber,
    private _name: PortfolioName,
    private _description: PortfolioDescription,
    private _status: PortfolioStatus,
    private readonly _startDate: Date,
    private _targetEndDate: Date | null,
    private _completedDate: Date | null,
    private _programIds: ProgramId[],
    private _initiativeIds: InitiativeId[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreatePortfolioProps): Portfolio {
    if (!props.organizationId) {
      throw new InvalidPortfolioStateError(
        "Portfolio requires an organization.",
      );
    }
    const startDate = new Date(props.startDate);
    if (Number.isNaN(startDate.getTime())) {
      throw new InvalidPortfolioStateError("Invalid start date.");
    }
    const target =
      props.targetEndDate == null ? null : new Date(props.targetEndDate);
    if (target && Number.isNaN(target.getTime())) {
      throw new InvalidPortfolioStateError("Invalid target end date.");
    }
    if (target && target.getTime() < startDate.getTime()) {
      throw new InvalidPortfolioStateError(
        "targetEndDate must be on or after startDate.",
      );
    }
    const now = props.now ?? new Date();
    const id = asPortfolioId(props.id ?? generateId());
    const number = props.portfolioNumber
      ? PortfolioNumber.create(props.portfolioNumber)
      : PortfolioNumber.generate(now);
    const p = new Portfolio(
      id,
      props.organizationId,
      number,
      PortfolioName.create(props.name),
      PortfolioDescription.create(props.description),
      PortfolioStatus.DRAFT,
      startDate,
      target,
      null,
      [],
      [],
      now,
      now,
      null,
    );
    p.record(
      PortfolioCreated.create({
        organizationId: props.organizationId,
        portfolioId: id,
        portfolioNumber: number.value,
        name: p.name.value,
        status: PortfolioStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return p;
  }

  static reconstitute(snapshot: PortfolioSnapshot): Portfolio {
    return new Portfolio(
      snapshot.id,
      snapshot.organizationId,
      PortfolioNumber.create(snapshot.portfolioNumber),
      PortfolioName.create(snapshot.name),
      PortfolioDescription.create(snapshot.description),
      snapshot.status,
      new Date(snapshot.startDate),
      snapshot.targetEndDate ? new Date(snapshot.targetEndDate) : null,
      snapshot.completedDate ? new Date(snapshot.completedDate) : null,
      snapshot.programIds as ProgramId[],
      snapshot.initiativeIds as InitiativeId[],
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get portfolioNumber(): PortfolioNumber {
    return this._portfolioNumber;
  }
  get name(): PortfolioName {
    return this._name;
  }
  get description(): PortfolioDescription {
    return this._description;
  }
  get status(): PortfolioStatus {
    return this._status;
  }
  get startDate(): Date {
    return new Date(this._startDate);
  }
  get targetEndDate(): Date | null {
    return this._targetEndDate ? new Date(this._targetEndDate) : null;
  }
  get completedDate(): Date | null {
    return this._completedDate ? new Date(this._completedDate) : null;
  }
  get programIds(): readonly ProgramId[] {
    return [...this._programIds];
  }
  get initiativeIds(): readonly InitiativeId[] {
    return [...this._initiativeIds];
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
  get isDraft(): boolean {
    return this._status === PortfolioStatus.DRAFT;
  }
  get isActive(): boolean {
    return this._status === PortfolioStatus.ACTIVE;
  }
  get isCompleted(): boolean {
    return this._status === PortfolioStatus.COMPLETED;
  }
  get isArchived(): boolean {
    return this._status === PortfolioStatus.ARCHIVED;
  }

  addProgramId(id: ProgramId, now: Date = new Date()): void {
    this.assertStructurallyEditable();
    if (!this._programIds.includes(id)) {
      this._programIds = [...this._programIds, id];
      this._updatedAt = now;
    }
  }

  addInitiativeId(id: InitiativeId, now: Date = new Date()): void {
    this.assertStructurallyEditable();
    if (!this._initiativeIds.includes(id)) {
      this._initiativeIds = [...this._initiativeIds, id];
      this._updatedAt = now;
    }
  }

  activate(now: Date = new Date()): void {
    this.assertNotCompleted();
    this.transitionTo(PortfolioStatus.ACTIVE, now);
    this.record(
      PortfolioActivated.create({
        organizationId: this._organizationId,
        portfolioId: this.id,
        occurredAt: now,
      }),
    );
  }

  hold(now: Date = new Date()): void {
    this.assertNotCompleted();
    this.transitionTo(PortfolioStatus.ON_HOLD, now);
    this.record(
      PortfolioHeld.create({
        organizationId: this._organizationId,
        portfolioId: this.id,
        occurredAt: now,
      }),
    );
  }

  resume(now: Date = new Date()): void {
    if (this._status !== PortfolioStatus.ON_HOLD) {
      throw new InvalidPortfolioStateError(
        `Only ON_HOLD portfolios can resume (status: ${this._status}).`,
      );
    }
    this.transitionTo(PortfolioStatus.ACTIVE, now);
    this.record(
      PortfolioActivated.create({
        organizationId: this._organizationId,
        portfolioId: this.id,
        occurredAt: now,
      }),
    );
  }

  complete(completedDate?: Date, now: Date = new Date()): void {
    this.assertNotCompleted();
    const done = completedDate ? new Date(completedDate) : now;
    if (Number.isNaN(done.getTime())) {
      throw new InvalidPortfolioStateError("Invalid completed date.");
    }
    if (done.getTime() < this._startDate.getTime()) {
      throw new InvalidPortfolioStateError(
        "completedDate must be on or after startDate.",
      );
    }
    this.transitionTo(PortfolioStatus.COMPLETED, now);
    this._completedDate = done;
    this.record(
      PortfolioCompleted.create({
        organizationId: this._organizationId,
        portfolioId: this.id,
        completedDate: done,
        occurredAt: now,
      }),
    );
  }

  cancel(now: Date = new Date()): void {
    this.assertNotCompleted();
    this.transitionTo(PortfolioStatus.CANCELLED, now);
    this.record(
      PortfolioCancelled.create({
        organizationId: this._organizationId,
        portfolioId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === PortfolioStatus.ARCHIVED) {
      throw new InvalidPortfolioStateError("Portfolio already archived.");
    }
    this.transitionTo(PortfolioStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      PortfolioArchived.create({
        organizationId: this._organizationId,
        portfolioId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): PortfolioSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      portfolioNumber: this._portfolioNumber.value,
      name: this._name.value,
      description: this._description.value,
      status: this._status,
      startDate: this.startDate,
      targetEndDate: this.targetEndDate,
      completedDate: this.completedDate,
      programIds: this._programIds.map(String),
      initiativeIds: this._initiativeIds.map(String),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: PortfolioStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionPortfolio(this._status, to)) {
      throw new InvalidPortfolioStateError(
        `Cannot transition portfolio from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertStructurallyEditable(): void {
    this.assertMutable();
    if (
      this._status === PortfolioStatus.COMPLETED ||
      this._status === PortfolioStatus.CANCELLED
    ) {
      throw new InvalidPortfolioStateError(
        "Cannot modify structure of terminal portfolios.",
      );
    }
  }

  private assertMutable(): void {
    if (this._status === PortfolioStatus.ARCHIVED) {
      throw new InvalidPortfolioStateError(
        "Archived portfolios are immutable.",
      );
    }
  }

  private assertNotCompleted(): void {
    if (this._status === PortfolioStatus.COMPLETED) {
      throw new InvalidPortfolioStateError(
        "Completed portfolios are immutable.",
      );
    }
  }
}
