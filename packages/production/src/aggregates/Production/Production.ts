import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import type { ProjectId } from "@creative-lab/projects";
import type { ProductionPriority as ProductionPriorityEnum } from "../../enums/ProductionPriority.js";
import {
  ProductionStatus,
  canTransitionProduction,
} from "../../enums/ProductionStatus.js";
import { InvalidProductionStateError } from "../../errors/ProductionErrors.js";
import {
  ProductionArchived,
  ProductionCompleted,
  ProductionCreated,
  ProductionPaused,
  ProductionResumed,
  ProductionStarted,
} from "../../events/production-events.js";
import { asProductionId, type ProductionId } from "../../types/ids.js";
import { ProductionDescription } from "../../value-objects/ProductionDescription.js";
import { ProductionName } from "../../value-objects/ProductionName.js";
import { ProductionPriorityVO } from "../../value-objects/ProductionPriority.js";

export type CreateProductionProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  workOrderId: WorkOrderId;
  name: string;
  description?: string | null;
  priority?: ProductionPriorityEnum;
  ownerId: string;
  id?: string;
  now?: Date;
};

export type ProductionSnapshot = {
  id: ProductionId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  workOrderId: WorkOrderId;
  name: string;
  description: string | null;
  status: ProductionStatus;
  priority: ProductionPriorityEnum;
  ownerId: string;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Active production effort. References Project and WorkOrder only.
 * Owns production execution state — not scheduling, allocation, or assets.
 */
export class Production extends AggregateRoot<ProductionId> {
  private constructor(
    id: ProductionId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _workOrderId: WorkOrderId,
    private _name: ProductionName,
    private _description: ProductionDescription,
    private _status: ProductionStatus,
    private _priority: ProductionPriorityVO,
    private _ownerId: string,
    private _startedAt: Date | null,
    private _completedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateProductionProps): Production {
    if (!props.projectId) {
      throw new InvalidProductionStateError(
        "Production requires a project reference.",
      );
    }
    if (!props.workOrderId) {
      throw new InvalidProductionStateError(
        "Production requires a work order reference.",
      );
    }
    const ownerId = props.ownerId?.trim();
    if (!ownerId) {
      throw new InvalidProductionStateError(
        "Production requires exactly one owner.",
      );
    }
    const now = props.now ?? new Date();
    const id = asProductionId(props.id ?? generateId());
    const production = new Production(
      id,
      props.organizationId,
      props.projectId,
      props.workOrderId,
      ProductionName.create(props.name),
      ProductionDescription.create(props.description),
      ProductionStatus.CREATED,
      ProductionPriorityVO.create(props.priority),
      ownerId,
      null,
      null,
      now,
      now,
    );
    production.record(
      ProductionCreated.create({
        organizationId: props.organizationId,
        productionId: id,
        projectId: props.projectId,
        workOrderId: props.workOrderId,
        name: production._name.value,
        status: ProductionStatus.CREATED,
        ownerId,
        occurredAt: now,
      }),
    );
    return production;
  }

  static reconstitute(snapshot: ProductionSnapshot): Production {
    return new Production(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      snapshot.workOrderId,
      ProductionName.create(snapshot.name),
      ProductionDescription.create(snapshot.description),
      snapshot.status,
      ProductionPriorityVO.create(snapshot.priority),
      snapshot.ownerId,
      snapshot.startedAt ? new Date(snapshot.startedAt) : null,
      snapshot.completedAt ? new Date(snapshot.completedAt) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get projectId(): ProjectId {
    return this._projectId;
  }
  get workOrderId(): WorkOrderId {
    return this._workOrderId;
  }
  get name(): ProductionName {
    return this._name;
  }
  get description(): ProductionDescription {
    return this._description;
  }
  get status(): ProductionStatus {
    return this._status;
  }
  get priority(): ProductionPriorityVO {
    return this._priority;
  }
  get ownerId(): string {
    return this._ownerId;
  }
  get startedAt(): Date | null {
    return this._startedAt ? new Date(this._startedAt) : null;
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
  get isCompleted(): boolean {
    return this._status === ProductionStatus.COMPLETED;
  }
  get isArchived(): boolean {
    return this._status === ProductionStatus.ARCHIVED;
  }
  get isActive(): boolean {
    return (
      this._status === ProductionStatus.ACTIVE ||
      this._status === ProductionStatus.PLANNING ||
      this._status === ProductionStatus.ON_HOLD
    );
  }

  plan(now: Date = new Date()): void {
    this.transitionTo(ProductionStatus.PLANNING, now);
  }

  start(now: Date = new Date()): void {
    this.assertMutable();
    this.transitionTo(ProductionStatus.ACTIVE, now);
    if (!this._startedAt) {
      this._startedAt = now;
    }
    this.record(
      ProductionStarted.create({
        organizationId: this._organizationId,
        productionId: this.id,
        occurredAt: now,
      }),
    );
  }

  pause(now: Date = new Date()): void {
    this.transitionTo(ProductionStatus.ON_HOLD, now);
    this.record(
      ProductionPaused.create({
        organizationId: this._organizationId,
        productionId: this.id,
        occurredAt: now,
      }),
    );
  }

  resume(now: Date = new Date()): void {
    this.transitionTo(ProductionStatus.ACTIVE, now);
    this.record(
      ProductionResumed.create({
        organizationId: this._organizationId,
        productionId: this.id,
        occurredAt: now,
      }),
    );
  }

  complete(now: Date = new Date()): void {
    this.assertMutable();
    this.transitionTo(ProductionStatus.COMPLETED, now);
    this._completedAt = now;
    this.record(
      ProductionCompleted.create({
        organizationId: this._organizationId,
        productionId: this.id,
        completedAt: now,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === ProductionStatus.ARCHIVED) {
      throw new InvalidProductionStateError(
        "Production is already archived.",
      );
    }
    this.transitionTo(ProductionStatus.ARCHIVED, now);
    this.record(
      ProductionArchived.create({
        organizationId: this._organizationId,
        productionId: this.id,
        occurredAt: now,
      }),
    );
  }

  transferOwner(ownerId: string, now: Date = new Date()): void {
    this.assertMutable();
    const next = ownerId?.trim();
    if (!next) {
      throw new InvalidProductionStateError(
        "Production requires exactly one owner.",
      );
    }
    this._ownerId = next;
    this._updatedAt = now;
  }

  updateDetails(props: {
    name?: string;
    description?: string | null;
    priority?: ProductionPriorityEnum;
    now?: Date;
  }): void {
    this.assertMutable();
    const now = props.now ?? new Date();
    if (props.name !== undefined) {
      this._name = ProductionName.create(props.name);
    }
    if (props.description !== undefined) {
      this._description = ProductionDescription.create(props.description);
    }
    if (props.priority !== undefined) {
      this._priority = ProductionPriorityVO.create(props.priority);
    }
    this._updatedAt = now;
  }

  toSnapshot(): ProductionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      workOrderId: this._workOrderId,
      name: this._name.value,
      description: this._description.value,
      status: this._status,
      priority: this._priority.value,
      ownerId: this._ownerId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: ProductionStatus, now: Date): void {
    if (this._status === ProductionStatus.ARCHIVED) {
      throw new InvalidProductionStateError(
        "Archived productions are immutable.",
      );
    }
    if (
      this._status === ProductionStatus.COMPLETED &&
      to !== ProductionStatus.ARCHIVED
    ) {
      throw new InvalidProductionStateError(
        "Completed productions are immutable except archive.",
      );
    }
    if (!canTransitionProduction(this._status, to)) {
      throw new InvalidProductionStateError(
        `Cannot transition production from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._status === ProductionStatus.ARCHIVED) {
      throw new InvalidProductionStateError(
        "Archived productions are immutable.",
      );
    }
    if (this._status === ProductionStatus.COMPLETED) {
      throw new InvalidProductionStateError(
        "Completed productions are immutable.",
      );
    }
  }
}
