import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import {
  DeliverableStatus,
  canTransitionDeliverable,
} from "../../enums/DeliverableStatus.js";
import { InvalidProjectStateError } from "../../errors/ProjectErrors.js";
import {
  DeliverableCompleted,
  DeliverableCreated,
} from "../../events/project-events.js";
import {
  asDeliverableId,
  type DeliverableId,
  type ProjectId,
} from "../../types/ids.js";
import { DeliverableName } from "../../value-objects/DeliverableName.js";
import { ProjectDescription } from "../../value-objects/ProjectDescription.js";

export type CreateDeliverableProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  name: string;
  description?: string | null;
  dueDate?: Date | null;
  workOrderReferences?: readonly WorkOrderId[];
  id?: string;
  now?: Date;
};

export type DeliverableSnapshot = {
  id: DeliverableId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  name: string;
  description: string | null;
  status: DeliverableStatus;
  dueDate: Date | null;
  completedAt: Date | null;
  workOrderReferences: string[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Contractual outcome of a project. References WorkOrder IDs — does not own execution.
 */
export class Deliverable extends AggregateRoot<DeliverableId> {
  private constructor(
    id: DeliverableId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _name: DeliverableName,
    private _description: ProjectDescription,
    private _status: DeliverableStatus,
    private _dueDate: Date | null,
    private _completedAt: Date | null,
    private _workOrderReferences: WorkOrderId[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateDeliverableProps): Deliverable {
    if (!props.projectId) {
      throw new InvalidProjectStateError("Deliverable requires a project.");
    }
    const dueDate = props.dueDate ? new Date(props.dueDate) : null;
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      throw new InvalidProjectStateError("dueDate must be a valid date.");
    }
    const now = props.now ?? new Date();
    const id = asDeliverableId(props.id ?? generateId());
    const refs = uniqueWorkOrderIds(props.workOrderReferences ?? []);
    const deliverable = new Deliverable(
      id,
      props.organizationId,
      props.projectId,
      DeliverableName.create(props.name),
      ProjectDescription.create(props.description),
      DeliverableStatus.PLANNED,
      dueDate,
      null,
      refs,
      now,
      now,
    );
    deliverable.record(
      DeliverableCreated.create({
        organizationId: props.organizationId,
        deliverableId: id,
        projectId: props.projectId,
        name: deliverable._name.value,
        status: DeliverableStatus.PLANNED,
        occurredAt: now,
      }),
    );
    return deliverable;
  }

  static reconstitute(snapshot: DeliverableSnapshot): Deliverable {
    return new Deliverable(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      DeliverableName.create(snapshot.name),
      ProjectDescription.create(snapshot.description),
      snapshot.status,
      snapshot.dueDate ? new Date(snapshot.dueDate) : null,
      snapshot.completedAt ? new Date(snapshot.completedAt) : null,
      snapshot.workOrderReferences as WorkOrderId[],
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
  get name(): DeliverableName {
    return this._name;
  }
  get description(): ProjectDescription {
    return this._description;
  }
  get status(): DeliverableStatus {
    return this._status;
  }
  get dueDate(): Date | null {
    return this._dueDate ? new Date(this._dueDate) : null;
  }
  get completedAt(): Date | null {
    return this._completedAt ? new Date(this._completedAt) : null;
  }
  get workOrderReferences(): readonly WorkOrderId[] {
    return [...this._workOrderReferences];
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isDelivered(): boolean {
    return this._status === DeliverableStatus.DELIVERED;
  }

  start(now: Date = new Date()): void {
    this.transitionTo(DeliverableStatus.IN_PROGRESS, now);
  }

  submitForReview(now: Date = new Date()): void {
    this.transitionTo(DeliverableStatus.READY_FOR_REVIEW, now);
  }

  approve(now: Date = new Date()): void {
    this.transitionTo(DeliverableStatus.APPROVED, now);
  }

  /**
   * Mark deliverable as DELIVERED (completed). Immutable afterwards.
   */
  complete(now: Date = new Date()): void {
    this.assertNotDelivered();
    // Allow complete from APPROVED (preferred) or READY_FOR_REVIEW via approve first
    if (this._status !== DeliverableStatus.APPROVED) {
      if (this._status === DeliverableStatus.READY_FOR_REVIEW) {
        this.transitionTo(DeliverableStatus.APPROVED, now);
      } else if (this._status === DeliverableStatus.IN_PROGRESS) {
        this.transitionTo(DeliverableStatus.READY_FOR_REVIEW, now);
        this.transitionTo(DeliverableStatus.APPROVED, now);
      } else if (this._status === DeliverableStatus.PLANNED) {
        this.transitionTo(DeliverableStatus.IN_PROGRESS, now);
        this.transitionTo(DeliverableStatus.READY_FOR_REVIEW, now);
        this.transitionTo(DeliverableStatus.APPROVED, now);
      }
    }
    this.transitionTo(DeliverableStatus.DELIVERED, now);
    this._completedAt = now;
    this.record(
      DeliverableCompleted.create({
        organizationId: this._organizationId,
        deliverableId: this.id,
        projectId: this._projectId,
        name: this._name.value,
        occurredAt: now,
      }),
    );
  }

  linkWorkOrder(workOrderId: WorkOrderId, now: Date = new Date()): void {
    this.assertNotDelivered();
    if (!workOrderId) {
      throw new InvalidProjectStateError("Work order reference is required.");
    }
    if (this._workOrderReferences.includes(workOrderId)) return;
    this._workOrderReferences = [...this._workOrderReferences, workOrderId];
    this._updatedAt = now;
  }

  unlinkWorkOrder(workOrderId: WorkOrderId, now: Date = new Date()): void {
    this.assertNotDelivered();
    this._workOrderReferences = this._workOrderReferences.filter(
      (id) => id !== workOrderId,
    );
    this._updatedAt = now;
  }

  toSnapshot(): DeliverableSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      name: this._name.value,
      description: this._description.value,
      status: this._status,
      dueDate: this.dueDate,
      completedAt: this.completedAt,
      workOrderReferences: this._workOrderReferences.map(String),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: DeliverableStatus, now: Date): void {
    this.assertNotDelivered();
    if (!canTransitionDeliverable(this._status, to)) {
      throw new InvalidProjectStateError(
        `Cannot transition deliverable from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertNotDelivered(): void {
    if (this._status === DeliverableStatus.DELIVERED) {
      throw new InvalidProjectStateError(
        `Deliverable "${this._name.value}" is completed and immutable.`,
      );
    }
  }
}

function uniqueWorkOrderIds(
  ids: readonly WorkOrderId[],
): WorkOrderId[] {
  const seen = new Set<string>();
  const out: WorkOrderId[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
