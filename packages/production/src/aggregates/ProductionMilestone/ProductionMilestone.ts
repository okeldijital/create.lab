import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { MilestoneStatus } from "../../enums/MilestoneStatus.js";
import {
  MilestoneSequenceError,
  InvalidProductionStateError,
} from "../../errors/ProductionErrors.js";
import {
  MilestoneActivated,
  MilestoneCompleted,
  MilestoneCreated,
} from "../../events/production-events.js";
import {
  asProductionMilestoneId,
  type ProductionId,
  type ProductionMilestoneId,
} from "../../types/ids.js";
import { MilestoneName } from "../../value-objects/MilestoneName.js";

export type CreateProductionMilestoneProps = {
  organizationId: OrganizationId;
  productionId: ProductionId;
  name: string;
  sequence: number;
  id?: string;
  now?: Date;
};

export type ProductionMilestoneSnapshot = {
  id: ProductionMilestoneId;
  organizationId: OrganizationId;
  productionId: ProductionId;
  name: string;
  sequence: number;
  status: MilestoneStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Checkpoint within a production (e.g. Mixing, Mastering).
 * Sequence unique; one ACTIVE; completed immutable.
 */
export class ProductionMilestone extends AggregateRoot<ProductionMilestoneId> {
  private constructor(
    id: ProductionMilestoneId,
    private readonly _organizationId: OrganizationId,
    private readonly _productionId: ProductionId,
    private _name: MilestoneName,
    private _sequence: number,
    private _status: MilestoneStatus,
    private _completedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateProductionMilestoneProps): ProductionMilestone {
    if (!props.productionId) {
      throw new InvalidProductionStateError(
        "Milestone requires a production.",
      );
    }
    if (!Number.isInteger(props.sequence) || props.sequence < 1) {
      throw new MilestoneSequenceError(
        `Milestone sequence must be an integer ≥ 1 (received ${props.sequence}).`,
      );
    }
    const now = props.now ?? new Date();
    const id = asProductionMilestoneId(props.id ?? generateId());
    const milestone = new ProductionMilestone(
      id,
      props.organizationId,
      props.productionId,
      MilestoneName.create(props.name),
      props.sequence,
      MilestoneStatus.PENDING,
      null,
      now,
      now,
    );
    milestone.record(
      MilestoneCreated.create({
        organizationId: props.organizationId,
        milestoneId: id,
        productionId: props.productionId,
        name: milestone._name.value,
        sequence: props.sequence,
        occurredAt: now,
      }),
    );
    return milestone;
  }

  static reconstitute(
    snapshot: ProductionMilestoneSnapshot,
  ): ProductionMilestone {
    return new ProductionMilestone(
      snapshot.id,
      snapshot.organizationId,
      snapshot.productionId,
      MilestoneName.create(snapshot.name),
      snapshot.sequence,
      snapshot.status,
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
  get name(): MilestoneName {
    return this._name;
  }
  get sequence(): number {
    return this._sequence;
  }
  get status(): MilestoneStatus {
    return this._status;
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
  get isActive(): boolean {
    return this._status === MilestoneStatus.ACTIVE;
  }
  get isCompleted(): boolean {
    return this._status === MilestoneStatus.COMPLETED;
  }

  activate(now: Date = new Date()): void {
    if (this._status === MilestoneStatus.COMPLETED) {
      throw new MilestoneSequenceError(
        `Completed milestone "${this._name.value}" is immutable.`,
      );
    }
    if (this._status === MilestoneStatus.ACTIVE) return;
    if (this._status !== MilestoneStatus.PENDING) {
      throw new MilestoneSequenceError(
        `Cannot activate milestone in status ${this._status}.`,
      );
    }
    this._status = MilestoneStatus.ACTIVE;
    this._updatedAt = now;
    this.record(
      MilestoneActivated.create({
        organizationId: this._organizationId,
        milestoneId: this.id,
        productionId: this._productionId,
        name: this._name.value,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    if (this._status === MilestoneStatus.COMPLETED) {
      throw new MilestoneSequenceError(
        `Milestone "${this._name.value}" is already completed.`,
      );
    }
    if (this._status !== MilestoneStatus.ACTIVE) {
      throw new MilestoneSequenceError(
        `Only ACTIVE milestones can be completed (status: ${this._status}).`,
      );
    }
    this._status = MilestoneStatus.COMPLETED;
    this._completedAt = now;
    this._updatedAt = now;
    this.record(
      MilestoneCompleted.create({
        organizationId: this._organizationId,
        milestoneId: this.id,
        productionId: this._productionId,
        name: this._name.value,
        occurredAt: now,
      }),
    );
  }

  /**
   * Reorder to a new sequence while PENDING only.
   */
  reorder(sequence: number, now: Date = new Date()): void {
    if (this._status === MilestoneStatus.COMPLETED) {
      throw new MilestoneSequenceError(
        `Completed milestone "${this._name.value}" cannot be reordered.`,
      );
    }
    if (!Number.isInteger(sequence) || sequence < 1) {
      throw new MilestoneSequenceError(
        `Milestone sequence must be an integer ≥ 1 (received ${sequence}).`,
      );
    }
    this._sequence = sequence;
    this._updatedAt = now;
  }

  toSnapshot(): ProductionMilestoneSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      productionId: this._productionId,
      name: this._name.value,
      sequence: this._sequence,
      status: this._status,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
