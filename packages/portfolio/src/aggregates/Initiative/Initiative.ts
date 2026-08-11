import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { InitiativePriority } from "../../enums/InitiativePriority.js";
import {
  InitiativeStatus,
  canTransitionInitiative,
} from "../../enums/InitiativeStatus.js";
import { InvalidPortfolioStateError } from "../../errors/PortfolioErrors.js";
import {
  InitiativeCancelled,
  InitiativeCompleted,
  InitiativeCreated,
} from "../../events/portfolio-events.js";
import {
  asInitiativeId,
  type InitiativeId,
  type PortfolioId,
} from "../../types/ids.js";
import { InitiativeTitle } from "../../value-objects/InitiativeTitle.js";
import { PortfolioDescription } from "../../value-objects/PortfolioDescription.js";

export type CreateInitiativeProps = {
  organizationId: OrganizationId;
  portfolioId: PortfolioId;
  title: string;
  description?: string | null;
  priority?: InitiativePriority;
  id?: string;
  now?: Date;
};

export type InitiativeSnapshot = {
  id: InitiativeId;
  organizationId: OrganizationId;
  portfolioId: PortfolioId;
  title: string;
  description: string | null;
  priority: InitiativePriority;
  status: InitiativeStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class Initiative extends AggregateRoot<InitiativeId> {
  private constructor(
    id: InitiativeId,
    private readonly _organizationId: OrganizationId,
    private readonly _portfolioId: PortfolioId,
    private readonly _title: InitiativeTitle,
    private _description: PortfolioDescription,
    private readonly _priority: InitiativePriority,
    private _status: InitiativeStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateInitiativeProps): Initiative {
    if (!props.portfolioId) {
      throw new InvalidPortfolioStateError("Initiative requires a portfolio.");
    }
    const priority = props.priority ?? InitiativePriority.MEDIUM;
    if (!Object.values(InitiativePriority).includes(priority)) {
      throw new InvalidPortfolioStateError(
        `Invalid initiative priority: ${String(priority)}`,
      );
    }
    const now = props.now ?? new Date();
    const id = asInitiativeId(props.id ?? generateId());
    const init = new Initiative(
      id,
      props.organizationId,
      props.portfolioId,
      InitiativeTitle.create(props.title),
      PortfolioDescription.create(props.description),
      priority,
      InitiativeStatus.PLANNED,
      now,
      now,
    );
    init.record(
      InitiativeCreated.create({
        organizationId: props.organizationId,
        initiativeId: id,
        portfolioId: props.portfolioId,
        title: init.title.value,
        status: InitiativeStatus.PLANNED,
        occurredAt: now,
      }),
    );
    return init;
  }

  static reconstitute(snapshot: InitiativeSnapshot): Initiative {
    return new Initiative(
      snapshot.id,
      snapshot.organizationId,
      snapshot.portfolioId,
      InitiativeTitle.create(snapshot.title),
      PortfolioDescription.create(snapshot.description),
      snapshot.priority,
      snapshot.status,
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
  get title(): InitiativeTitle {
    return this._title;
  }
  get description(): PortfolioDescription {
    return this._description;
  }
  get priority(): InitiativePriority {
    return this._priority;
  }
  get status(): InitiativeStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isCompleted(): boolean {
    return this._status === InitiativeStatus.COMPLETED;
  }
  get isTerminal(): boolean {
    return (
      this._status === InitiativeStatus.COMPLETED ||
      this._status === InitiativeStatus.CANCELLED
    );
  }

  activate(now: Date = new Date()): void {
    this.transitionTo(InitiativeStatus.ACTIVE, now);
  }

  complete(now: Date = new Date()): void {
    this.transitionTo(InitiativeStatus.COMPLETED, now);
    this.record(
      InitiativeCompleted.create({
        organizationId: this._organizationId,
        initiativeId: this.id,
        portfolioId: this._portfolioId,
        occurredAt: now,
      }),
    );
  }

  cancel(now: Date = new Date()): void {
    this.transitionTo(InitiativeStatus.CANCELLED, now);
    this.record(
      InitiativeCancelled.create({
        organizationId: this._organizationId,
        initiativeId: this.id,
        portfolioId: this._portfolioId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): InitiativeSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      portfolioId: this._portfolioId,
      title: this._title.value,
      description: this._description.value,
      priority: this._priority,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: InitiativeStatus, now: Date): void {
    if (this.isTerminal) {
      throw new InvalidPortfolioStateError(
        "Completed or cancelled initiatives are immutable.",
      );
    }
    if (!canTransitionInitiative(this._status, to)) {
      throw new InvalidPortfolioStateError(
        `Cannot transition initiative from ${this._status} to ${to}.`,
      );
    }
    this._status = to;
    this._updatedAt = now;
  }
}
