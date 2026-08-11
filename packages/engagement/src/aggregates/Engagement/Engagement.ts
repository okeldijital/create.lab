import { AggregateRoot, generateId } from "@creative-lab/core";
import type { ContractId } from "@creative-lab/contracts";
import type { CustomerId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import {
  EngagementStatus,
  canTransitionEngagement,
} from "../../enums/EngagementStatus.js";
import { InvalidEngagementStateError } from "../../errors/EngagementErrors.js";
import {
  EngagementActivated,
  EngagementArchived,
  EngagementCancelled,
  EngagementCompleted,
  EngagementCreated,
  EngagementSuspended,
} from "../../events/engagement-events.js";
import {
  asEngagementId,
  type DeliverableId,
  type EngagementId,
  type MilestoneId,
  type ObligationId,
} from "../../types/ids.js";
import { EngagementNumber } from "../../value-objects/EngagementNumber.js";

export type CreateEngagementProps = {
  organizationId: OrganizationId;
  customerId: CustomerId;
  contractId: ContractId;
  projectId?: ProjectId | null;
  engagementNumber?: string;
  startDate: Date;
  targetCompletionDate?: Date | null;
  id?: string;
  now?: Date;
};

export type EngagementSnapshot = {
  id: EngagementId;
  organizationId: OrganizationId;
  engagementNumber: string;
  customerId: CustomerId;
  contractId: ContractId;
  projectId: string | null;
  status: EngagementStatus;
  startDate: Date;
  targetCompletionDate: Date | null;
  completedDate: Date | null;
  deliverableIds: string[];
  milestoneIds: string[];
  obligationIds: string[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Formal execution of a contract. Number/customer/contract immutable.
 */
export class Engagement extends AggregateRoot<EngagementId> {
  private constructor(
    id: EngagementId,
    private readonly _organizationId: OrganizationId,
    private readonly _engagementNumber: EngagementNumber,
    private readonly _customerId: CustomerId,
    private readonly _contractId: ContractId,
    private readonly _projectId: ProjectId | null,
    private _status: EngagementStatus,
    private readonly _startDate: Date,
    private _targetCompletionDate: Date | null,
    private _completedDate: Date | null,
    private _deliverableIds: DeliverableId[],
    private _milestoneIds: MilestoneId[],
    private _obligationIds: ObligationId[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateEngagementProps): Engagement {
    if (!props.organizationId) {
      throw new InvalidEngagementStateError(
        "Engagement requires an organization.",
      );
    }
    if (!props.customerId) {
      throw new InvalidEngagementStateError("Engagement requires a customer.");
    }
    if (!props.contractId) {
      throw new InvalidEngagementStateError("Engagement requires a contract.");
    }
    const startDate = new Date(props.startDate);
    if (Number.isNaN(startDate.getTime())) {
      throw new InvalidEngagementStateError("Invalid start date.");
    }
    const target =
      props.targetCompletionDate == null
        ? null
        : new Date(props.targetCompletionDate);
    if (target && Number.isNaN(target.getTime())) {
      throw new InvalidEngagementStateError("Invalid target completion date.");
    }
    if (target && target.getTime() < startDate.getTime()) {
      throw new InvalidEngagementStateError(
        "targetCompletionDate must be on or after startDate.",
      );
    }
    const now = props.now ?? new Date();
    const id = asEngagementId(props.id ?? generateId());
    const number = props.engagementNumber
      ? EngagementNumber.create(props.engagementNumber)
      : EngagementNumber.generate(now);
    const eng = new Engagement(
      id,
      props.organizationId,
      number,
      props.customerId,
      props.contractId,
      props.projectId ?? null,
      EngagementStatus.DRAFT,
      startDate,
      target,
      null,
      [],
      [],
      [],
      now,
      now,
      null,
    );
    eng.record(
      EngagementCreated.create({
        organizationId: props.organizationId,
        engagementId: id,
        engagementNumber: number.value,
        customerId: props.customerId,
        contractId: props.contractId,
        status: EngagementStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return eng;
  }

  static reconstitute(snapshot: EngagementSnapshot): Engagement {
    return new Engagement(
      snapshot.id,
      snapshot.organizationId,
      EngagementNumber.create(snapshot.engagementNumber),
      snapshot.customerId,
      snapshot.contractId,
      (snapshot.projectId as ProjectId | null) ?? null,
      snapshot.status,
      new Date(snapshot.startDate),
      snapshot.targetCompletionDate
        ? new Date(snapshot.targetCompletionDate)
        : null,
      snapshot.completedDate ? new Date(snapshot.completedDate) : null,
      snapshot.deliverableIds as DeliverableId[],
      snapshot.milestoneIds as MilestoneId[],
      snapshot.obligationIds as ObligationId[],
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get engagementNumber(): EngagementNumber {
    return this._engagementNumber;
  }
  get customerId(): CustomerId {
    return this._customerId;
  }
  get contractId(): ContractId {
    return this._contractId;
  }
  get projectId(): ProjectId | null {
    return this._projectId;
  }
  get status(): EngagementStatus {
    return this._status;
  }
  get startDate(): Date {
    return new Date(this._startDate);
  }
  get targetCompletionDate(): Date | null {
    return this._targetCompletionDate
      ? new Date(this._targetCompletionDate)
      : null;
  }
  get completedDate(): Date | null {
    return this._completedDate ? new Date(this._completedDate) : null;
  }
  get deliverableIds(): readonly DeliverableId[] {
    return [...this._deliverableIds];
  }
  get milestoneIds(): readonly MilestoneId[] {
    return [...this._milestoneIds];
  }
  get obligationIds(): readonly ObligationId[] {
    return [...this._obligationIds];
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
    return this._status === EngagementStatus.DRAFT;
  }
  get isActive(): boolean {
    return this._status === EngagementStatus.ACTIVE;
  }
  get isCompleted(): boolean {
    return this._status === EngagementStatus.COMPLETED;
  }
  get isArchived(): boolean {
    return this._status === EngagementStatus.ARCHIVED;
  }

  addDeliverableId(id: DeliverableId, now: Date = new Date()): void {
    this.assertStructurallyEditable();
    if (!this._deliverableIds.includes(id)) {
      this._deliverableIds = [...this._deliverableIds, id];
      this._updatedAt = now;
    }
  }

  addMilestoneId(id: MilestoneId, now: Date = new Date()): void {
    this.assertStructurallyEditable();
    if (!this._milestoneIds.includes(id)) {
      this._milestoneIds = [...this._milestoneIds, id];
      this._updatedAt = now;
    }
  }

  addObligationId(id: ObligationId, now: Date = new Date()): void {
    this.assertStructurallyEditable();
    if (!this._obligationIds.includes(id)) {
      this._obligationIds = [...this._obligationIds, id];
      this._updatedAt = now;
    }
  }

  activate(now: Date = new Date()): void {
    this.assertNotCompleted();
    this.transitionTo(EngagementStatus.ACTIVE, now);
    this.record(
      EngagementActivated.create({
        organizationId: this._organizationId,
        engagementId: this.id,
        occurredAt: now,
      }),
    );
  }

  suspend(now: Date = new Date()): void {
    this.assertNotCompleted();
    this.transitionTo(EngagementStatus.SUSPENDED, now);
    this.record(
      EngagementSuspended.create({
        organizationId: this._organizationId,
        engagementId: this.id,
        occurredAt: now,
      }),
    );
  }

  resume(now: Date = new Date()): void {
    if (this._status !== EngagementStatus.SUSPENDED) {
      throw new InvalidEngagementStateError(
        `Only SUSPENDED engagements can resume (status: ${this._status}).`,
      );
    }
    this.transitionTo(EngagementStatus.ACTIVE, now);
    this.record(
      EngagementActivated.create({
        organizationId: this._organizationId,
        engagementId: this.id,
        occurredAt: now,
      }),
    );
  }

  complete(completedDate?: Date, now: Date = new Date()): void {
    this.assertNotCompleted();
    const done = completedDate ? new Date(completedDate) : now;
    if (Number.isNaN(done.getTime())) {
      throw new InvalidEngagementStateError("Invalid completed date.");
    }
    if (done.getTime() < this._startDate.getTime()) {
      throw new InvalidEngagementStateError(
        "completedDate must be on or after startDate.",
      );
    }
    this.transitionTo(EngagementStatus.COMPLETED, now);
    this._completedDate = done;
    this.record(
      EngagementCompleted.create({
        organizationId: this._organizationId,
        engagementId: this.id,
        completedDate: done,
        occurredAt: now,
      }),
    );
  }

  cancel(now: Date = new Date()): void {
    this.assertNotCompleted();
    this.transitionTo(EngagementStatus.CANCELLED, now);
    this.record(
      EngagementCancelled.create({
        organizationId: this._organizationId,
        engagementId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === EngagementStatus.ARCHIVED) {
      throw new InvalidEngagementStateError("Engagement already archived.");
    }
    this.transitionTo(EngagementStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      EngagementArchived.create({
        organizationId: this._organizationId,
        engagementId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): EngagementSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      engagementNumber: this._engagementNumber.value,
      customerId: this._customerId,
      contractId: this._contractId,
      projectId: this._projectId,
      status: this._status,
      startDate: this.startDate,
      targetCompletionDate: this.targetCompletionDate,
      completedDate: this.completedDate,
      deliverableIds: this._deliverableIds.map(String),
      milestoneIds: this._milestoneIds.map(String),
      obligationIds: this._obligationIds.map(String),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: EngagementStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionEngagement(this._status, to)) {
      throw new InvalidEngagementStateError(
        `Cannot transition engagement from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertStructurallyEditable(): void {
    this.assertMutable();
    if (
      this._status === EngagementStatus.COMPLETED ||
      this._status === EngagementStatus.CANCELLED
    ) {
      throw new InvalidEngagementStateError(
        "Cannot modify structure of terminal engagements.",
      );
    }
  }

  private assertMutable(): void {
    if (this._status === EngagementStatus.ARCHIVED) {
      throw new InvalidEngagementStateError(
        "Archived engagements are immutable.",
      );
    }
  }

  /** Terminal business state: no further lifecycle except archive. */
  assertNotCompleted(): void {
    if (this._status === EngagementStatus.COMPLETED) {
      throw new InvalidEngagementStateError(
        "Completed engagements are immutable.",
      );
    }
  }
}
