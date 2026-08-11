import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { PaymentMethod } from "../../enums/PaymentMethod.js";
import { PaymentStatus } from "../../enums/PaymentStatus.js";
import { InvalidInvoiceStateError } from "../../errors/BillingErrors.js";
import {
  PaymentCompleted,
  PaymentRecorded,
  PaymentRefunded,
} from "../../events/billing-events.js";
import {
  asPaymentId,
  type InvoiceId,
  type PaymentId,
} from "../../types/ids.js";
import { Money } from "../../value-objects/Money.js";
import { PaymentReference } from "../../value-objects/PaymentReference.js";

export type CreatePaymentProps = {
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  reference: string;
  amountMinor: number;
  currency: string;
  paymentDate?: Date;
  method?: PaymentMethod;
  id?: string;
  now?: Date;
};

export type PaymentSnapshot = {
  id: PaymentId;
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  reference: string;
  amountMinor: number;
  currency: string;
  paymentDate: Date;
  method: PaymentMethod;
  status: PaymentStatus;
  refundedMinor: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Business acknowledgement of payment — not a gateway transaction.
 */
export class Payment extends AggregateRoot<PaymentId> {
  private constructor(
    id: PaymentId,
    private readonly _organizationId: OrganizationId,
    private readonly _invoiceId: InvoiceId,
    private readonly _reference: PaymentReference,
    private readonly _amount: Money,
    private readonly _paymentDate: Date,
    private readonly _method: PaymentMethod,
    private _status: PaymentStatus,
    private _refunded: Money,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreatePaymentProps): Payment {
    if (!props.invoiceId) {
      throw new InvalidInvoiceStateError("Payment requires an invoice.");
    }
    const amount = Money.fromMinorUnits(props.amountMinor, props.currency);
    amount.assertNonNegative("Payment amount");
    if (amount.isZero) {
      throw new InvalidInvoiceStateError("Payment amount must be > 0.");
    }
    const method = props.method ?? PaymentMethod.OTHER;
    if (!Object.values(PaymentMethod).includes(method)) {
      throw new InvalidInvoiceStateError(
        `Invalid payment method: ${String(method)}`,
      );
    }
    const now = props.now ?? new Date();
    const paymentDate = props.paymentDate
      ? new Date(props.paymentDate)
      : now;
    const id = asPaymentId(props.id ?? generateId());
    const payment = new Payment(
      id,
      props.organizationId,
      props.invoiceId,
      PaymentReference.create(props.reference),
      amount,
      paymentDate,
      method,
      PaymentStatus.PENDING,
      Money.zero(props.currency),
      now,
      now,
    );
    payment.record(
      PaymentRecorded.create({
        organizationId: props.organizationId,
        paymentId: id,
        invoiceId: props.invoiceId,
        amountMinor: amount.minorUnits,
        status: PaymentStatus.PENDING,
        occurredAt: now,
      }),
    );
    return payment;
  }

  static reconstitute(snapshot: PaymentSnapshot): Payment {
    return new Payment(
      snapshot.id,
      snapshot.organizationId,
      snapshot.invoiceId,
      PaymentReference.create(snapshot.reference),
      Money.fromMinorUnits(snapshot.amountMinor, snapshot.currency),
      new Date(snapshot.paymentDate),
      snapshot.method,
      snapshot.status,
      Money.fromMinorUnits(snapshot.refundedMinor, snapshot.currency),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get invoiceId(): InvoiceId {
    return this._invoiceId;
  }
  get reference(): PaymentReference {
    return this._reference;
  }
  get amount(): Money {
    return this._amount;
  }
  get paymentDate(): Date {
    return new Date(this._paymentDate);
  }
  get method(): PaymentMethod {
    return this._method;
  }
  get status(): PaymentStatus {
    return this._status;
  }
  get refunded(): Money {
    return this._refunded;
  }
  get netApplied(): Money {
    return this._amount.subtract(this._refunded);
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isCompleted(): boolean {
    return this._status === PaymentStatus.COMPLETED;
  }

  complete(now: Date = new Date()): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new InvalidInvoiceStateError(
        `Only PENDING payments can complete (status: ${this._status}).`,
      );
    }
    this._status = PaymentStatus.COMPLETED;
    this._updatedAt = now;
    this.record(
      PaymentCompleted.create({
        organizationId: this._organizationId,
        paymentId: this.id,
        invoiceId: this._invoiceId,
        occurredAt: now,
      }),
    );
  }

  fail(now: Date = new Date()): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new InvalidInvoiceStateError(
        `Only PENDING payments can fail (status: ${this._status}).`,
      );
    }
    this._status = PaymentStatus.FAILED;
    this._updatedAt = now;
  }

  refund(amountMinor: number, now: Date = new Date()): void {
    if (this._status !== PaymentStatus.COMPLETED) {
      throw new InvalidInvoiceStateError(
        "Only COMPLETED payments can be refunded.",
      );
    }
    const refund = Money.fromMinorUnits(
      amountMinor,
      this._amount.currencyCode,
    );
    refund.assertNonNegative("Refund");
    const remaining = this._amount.subtract(this._refunded);
    if (refund.greaterThan(remaining)) {
      throw new InvalidInvoiceStateError(
        "Refund cannot exceed paid amount.",
      );
    }
    this._refunded = this._refunded.add(refund);
    if (this._refunded.greaterThanOrEqual(this._amount)) {
      this._status = PaymentStatus.REFUNDED;
    }
    this._updatedAt = now;
    this.record(
      PaymentRefunded.create({
        organizationId: this._organizationId,
        paymentId: this.id,
        invoiceId: this._invoiceId,
        refundMinor: refund.minorUnits,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): PaymentSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      invoiceId: this._invoiceId,
      reference: this._reference.value,
      amountMinor: this._amount.minorUnits,
      currency: this._amount.currencyCode,
      paymentDate: this.paymentDate,
      method: this._method,
      status: this._status,
      refundedMinor: this._refunded.minorUnits,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
