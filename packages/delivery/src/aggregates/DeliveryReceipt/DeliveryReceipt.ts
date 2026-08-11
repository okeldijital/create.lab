import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ReceiptStatus } from "../../enums/ReceiptStatus.js";
import { InvalidDeliveryStateError } from "../../errors/DeliveryErrors.js";
import {
  ReceiptConfirmed,
  ReceiptCreated,
  ReceiptRejected,
} from "../../events/delivery-events.js";
import {
  asDeliveryReceiptId,
  type DeliveryId,
  type DeliveryReceiptId,
} from "../../types/ids.js";
import { ReceiptNotes } from "../../value-objects/ReceiptNotes.js";
import { RecipientReference } from "../../value-objects/RecipientReference.js";

export type CreateDeliveryReceiptProps = {
  organizationId: OrganizationId;
  deliveryId: DeliveryId;
  recipientId: string;
  notes?: string | null;
  id?: string;
  now?: Date;
};

export type DeliveryReceiptSnapshot = {
  id: DeliveryReceiptId;
  organizationId: OrganizationId;
  deliveryId: DeliveryId;
  recipientId: string;
  receivedAt: Date | null;
  status: ReceiptStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Acknowledgement of delivery by a recipient.
 * Immutable after CONFIRMED or REJECTED.
 */
export class DeliveryReceipt extends AggregateRoot<DeliveryReceiptId> {
  private constructor(
    id: DeliveryReceiptId,
    private readonly _organizationId: OrganizationId,
    private readonly _deliveryId: DeliveryId,
    private readonly _recipientId: RecipientReference,
    private _receivedAt: Date | null,
    private _status: ReceiptStatus,
    private readonly _notes: ReceiptNotes,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateDeliveryReceiptProps): DeliveryReceipt {
    if (!props.deliveryId) {
      throw new InvalidDeliveryStateError("Receipt requires a delivery.");
    }
    const now = props.now ?? new Date();
    const id = asDeliveryReceiptId(props.id ?? generateId());
    const receipt = new DeliveryReceipt(
      id,
      props.organizationId,
      props.deliveryId,
      RecipientReference.create(props.recipientId),
      null,
      ReceiptStatus.PENDING,
      ReceiptNotes.create(props.notes),
      now,
      now,
    );
    receipt.record(
      ReceiptCreated.create({
        organizationId: props.organizationId,
        receiptId: id,
        deliveryId: props.deliveryId,
        recipientId: receipt._recipientId.value,
        status: ReceiptStatus.PENDING,
        occurredAt: now,
      }),
    );
    return receipt;
  }

  static reconstitute(snapshot: DeliveryReceiptSnapshot): DeliveryReceipt {
    return new DeliveryReceipt(
      snapshot.id,
      snapshot.organizationId,
      snapshot.deliveryId,
      RecipientReference.create(snapshot.recipientId),
      snapshot.receivedAt ? new Date(snapshot.receivedAt) : null,
      snapshot.status,
      ReceiptNotes.create(snapshot.notes),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get deliveryId(): DeliveryId {
    return this._deliveryId;
  }
  get recipientId(): string {
    return this._recipientId.value;
  }
  get receivedAt(): Date | null {
    return this._receivedAt ? new Date(this._receivedAt) : null;
  }
  get status(): ReceiptStatus {
    return this._status;
  }
  get notes(): ReceiptNotes {
    return this._notes;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isTerminal(): boolean {
    return (
      this._status === ReceiptStatus.CONFIRMED ||
      this._status === ReceiptStatus.REJECTED
    );
  }

  confirm(now: Date = new Date()): void {
    this.assertPending();
    this._status = ReceiptStatus.CONFIRMED;
    this._receivedAt = now;
    this._updatedAt = now;
    this.record(
      ReceiptConfirmed.create({
        organizationId: this._organizationId,
        receiptId: this.id,
        deliveryId: this._deliveryId,
        occurredAt: now,
      }),
    );
  }

  reject(now: Date = new Date()): void {
    this.assertPending();
    this._status = ReceiptStatus.REJECTED;
    this._receivedAt = now;
    this._updatedAt = now;
    this.record(
      ReceiptRejected.create({
        organizationId: this._organizationId,
        receiptId: this.id,
        deliveryId: this._deliveryId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): DeliveryReceiptSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      deliveryId: this._deliveryId,
      recipientId: this._recipientId.value,
      receivedAt: this.receivedAt,
      status: this._status,
      notes: this._notes.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertPending(): void {
    if (this._status !== ReceiptStatus.PENDING) {
      throw new InvalidDeliveryStateError(
        `Receipt already ${this._status.toLowerCase()}; cannot confirm twice.`,
      );
    }
  }
}
