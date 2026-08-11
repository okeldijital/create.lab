import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { ReviewId } from "@creative-lab/review";
import {
  DeliveryStatus,
  canTransitionDelivery,
} from "../../enums/DeliveryStatus.js";
import type { DeliveryPriority as DeliveryPriorityEnum } from "../../enums/DeliveryPriority.js";
import { InvalidDeliveryStateError } from "../../errors/DeliveryErrors.js";
import {
  DeliveryArchived,
  DeliveryConfirmed,
  DeliveryCreated,
  DeliveryDelivered,
  DeliveryReady,
} from "../../events/delivery-events.js";
import {
  asDeliveryId,
  type DeliveryId,
  type DeliveryPackageId,
} from "../../types/ids.js";
import { DeliveryReference } from "../../value-objects/DeliveryReference.js";

export type CreateDeliveryProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  productionId: ProductionId;
  reviewId: ReviewId;
  packageId?: DeliveryPackageId | null;
  referenceNumber?: string;
  priority?: DeliveryPriorityEnum;
  id?: string;
  now?: Date;
};

export type DeliverySnapshot = {
  id: DeliveryId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  productionId: ProductionId;
  reviewId: ReviewId;
  packageId: DeliveryPackageId | null;
  referenceNumber: string;
  status: DeliveryStatus;
  deliveredAt: Date | null;
  completedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Official delivery of approved work.
 * Project, production, and review references are immutable.
 * Owns delivery state only — no storage or transfer.
 */
export class Delivery extends AggregateRoot<DeliveryId> {
  private constructor(
    id: DeliveryId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _productionId: ProductionId,
    private readonly _reviewId: ReviewId,
    private _packageId: DeliveryPackageId | null,
    private readonly _referenceNumber: DeliveryReference,
    private _status: DeliveryStatus,
    private _deliveredAt: Date | null,
    private _completedAt: Date | null,
    private _archivedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateDeliveryProps): Delivery {
    if (!props.projectId) {
      throw new InvalidDeliveryStateError(
        "Delivery requires a project reference.",
      );
    }
    if (!props.productionId) {
      throw new InvalidDeliveryStateError(
        "Delivery requires a production reference.",
      );
    }
    if (!props.reviewId) {
      throw new InvalidDeliveryStateError(
        "Delivery requires a review reference.",
      );
    }
    const now = props.now ?? new Date();
    const id = asDeliveryId(props.id ?? generateId());
    const reference = props.referenceNumber
      ? DeliveryReference.create(props.referenceNumber)
      : DeliveryReference.generate(now);

    const delivery = new Delivery(
      id,
      props.organizationId,
      props.projectId,
      props.productionId,
      props.reviewId,
      props.packageId ?? null,
      reference,
      DeliveryStatus.DRAFT,
      null,
      null,
      null,
      now,
      now,
    );
    delivery.record(
      DeliveryCreated.create({
        organizationId: props.organizationId,
        deliveryId: id,
        projectId: props.projectId,
        productionId: props.productionId,
        reviewId: props.reviewId,
        referenceNumber: reference.value,
        status: DeliveryStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return delivery;
  }

  static reconstitute(snapshot: DeliverySnapshot): Delivery {
    return new Delivery(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      snapshot.productionId,
      snapshot.reviewId,
      snapshot.packageId,
      DeliveryReference.create(snapshot.referenceNumber),
      snapshot.status,
      snapshot.deliveredAt ? new Date(snapshot.deliveredAt) : null,
      snapshot.completedAt ? new Date(snapshot.completedAt) : null,
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
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
  get productionId(): ProductionId {
    return this._productionId;
  }
  get reviewId(): ReviewId {
    return this._reviewId;
  }
  get packageId(): DeliveryPackageId | null {
    return this._packageId;
  }
  get referenceNumber(): DeliveryReference {
    return this._referenceNumber;
  }
  get status(): DeliveryStatus {
    return this._status;
  }
  get deliveredAt(): Date | null {
    return this._deliveredAt ? new Date(this._deliveredAt) : null;
  }
  get completedAt(): Date | null {
    return this._completedAt ? new Date(this._completedAt) : null;
  }
  get archivedAt(): Date | null {
    return this._archivedAt ? new Date(this._archivedAt) : null;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isArchived(): boolean {
    return this._status === DeliveryStatus.ARCHIVED;
  }
  get isDelivered(): boolean {
    return (
      this._status === DeliveryStatus.DELIVERED ||
      this._status === DeliveryStatus.CONFIRMED
    );
  }

  attachPackage(packageId: DeliveryPackageId, now: Date = new Date()): void {
    this.assertMutable();
    if (this._status !== DeliveryStatus.DRAFT) {
      throw new InvalidDeliveryStateError(
        "Package can only be attached while delivery is DRAFT.",
      );
    }
    this._packageId = packageId;
    this._updatedAt = now;
  }

  markReady(now: Date = new Date()): void {
    this.assertMutable();
    this.transitionTo(DeliveryStatus.READY, now);
    this.record(
      DeliveryReady.create({
        organizationId: this._organizationId,
        deliveryId: this.id,
        occurredAt: now,
      }),
    );
  }

  deliver(now: Date = new Date()): void {
    this.assertMutable();
    if (this._status === DeliveryStatus.DELIVERED) {
      throw new InvalidDeliveryStateError("Delivery already delivered.");
    }
    this.transitionTo(DeliveryStatus.DELIVERED, now);
    this._deliveredAt = now;
    this.record(
      DeliveryDelivered.create({
        organizationId: this._organizationId,
        deliveryId: this.id,
        deliveredAt: now,
        occurredAt: now,
      }),
    );
  }

  confirm(now: Date = new Date()): void {
    this.assertMutable();
    if (this._status !== DeliveryStatus.DELIVERED) {
      throw new InvalidDeliveryStateError(
        "Cannot confirm before delivery.",
      );
    }
    this.transitionTo(DeliveryStatus.CONFIRMED, now);
    this._completedAt = now;
    this.record(
      DeliveryConfirmed.create({
        organizationId: this._organizationId,
        deliveryId: this.id,
        completedAt: now,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === DeliveryStatus.ARCHIVED) {
      throw new InvalidDeliveryStateError("Delivery already archived.");
    }
    this.transitionTo(DeliveryStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      DeliveryArchived.create({
        organizationId: this._organizationId,
        deliveryId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): DeliverySnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      productionId: this._productionId,
      reviewId: this._reviewId,
      packageId: this._packageId,
      referenceNumber: this._referenceNumber.value,
      status: this._status,
      deliveredAt: this.deliveredAt,
      completedAt: this.completedAt,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: DeliveryStatus, now: Date): void {
    if (this._status === DeliveryStatus.ARCHIVED) {
      throw new InvalidDeliveryStateError(
        "Archived deliveries are immutable.",
      );
    }
    if (!canTransitionDelivery(this._status, to)) {
      throw new InvalidDeliveryStateError(
        `Cannot transition delivery from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._status === DeliveryStatus.ARCHIVED) {
      throw new InvalidDeliveryStateError(
        "Archived deliveries are immutable.",
      );
    }
  }
}
