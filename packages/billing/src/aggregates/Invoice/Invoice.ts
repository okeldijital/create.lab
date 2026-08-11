import { AggregateRoot, generateId } from "@creative-lab/core";
import type { DeliveryId } from "@creative-lab/delivery";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import {
  InvoiceStatus,
  canTransitionInvoice,
} from "../../enums/InvoiceStatus.js";
import {
  InvalidInvoiceStateError,
  InvoiceAlreadyPaidError,
  InvoiceAlreadyVoidedError,
} from "../../errors/BillingErrors.js";
import {
  InvoiceArchived,
  InvoiceCreated,
  InvoiceIssued,
  InvoicePaid,
  InvoicePartiallyPaid,
  InvoiceVoided,
} from "../../events/billing-events.js";
import { InvoiceCalculationPolicy } from "../../policies/InvoiceCalculationPolicy.js";
import {
  asInvoiceId,
  type InvoiceId,
  type InvoiceLineId,
} from "../../types/ids.js";
import { Currency } from "../../value-objects/Currency.js";
import { InvoiceNumber } from "../../value-objects/InvoiceNumber.js";
import { Money } from "../../value-objects/Money.js";
import type { InvoiceLine } from "../InvoiceLine/InvoiceLine.js";

export type CreateInvoiceProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  deliveryId: DeliveryId;
  customerId: string;
  currency?: string;
  invoiceNumber?: string;
  issueDate?: Date | null;
  dueDate?: Date | null;
  id?: string;
  now?: Date;
};

export type InvoiceSnapshot = {
  id: InvoiceId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  deliveryId: DeliveryId;
  invoiceNumber: string;
  customerId: string;
  issueDate: Date | null;
  dueDate: Date | null;
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  totalMinor: number;
  balanceMinor: number;
  paidMinor: number;
  creditedMinor: number;
  lineIds: string[];
  status: InvoiceStatus;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Legal billing document. Project/delivery/currency/number immutable.
 * Totals recalculated from lines while DRAFT; payment state after issue.
 */
export class Invoice extends AggregateRoot<InvoiceId> {
  private constructor(
    id: InvoiceId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _deliveryId: DeliveryId,
    private readonly _invoiceNumber: InvoiceNumber,
    private readonly _customerId: string,
    private _issueDate: Date | null,
    private _dueDate: Date | null,
    private readonly _currency: Currency,
    private _subtotal: Money,
    private _tax: Money,
    private _discount: Money,
    private _total: Money,
    private _balance: Money,
    private _paid: Money,
    private _credited: Money,
    private _lineIds: InvoiceLineId[],
    private _status: InvoiceStatus,
    private _archivedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateInvoiceProps): Invoice {
    if (!props.projectId) {
      throw new InvalidInvoiceStateError("Invoice requires a project.");
    }
    if (!props.deliveryId) {
      throw new InvalidInvoiceStateError("Invoice requires a delivery.");
    }
    const customerId = props.customerId?.trim();
    if (!customerId) {
      throw new InvalidInvoiceStateError("Invoice requires a customerId.");
    }
    const currency = Currency.create(props.currency ?? "USD");
    const now = props.now ?? new Date();
    const id = asInvoiceId(props.id ?? generateId());
    const number = props.invoiceNumber
      ? InvoiceNumber.create(props.invoiceNumber)
      : InvoiceNumber.generate(now);
    const zero = Money.zero(currency);

    const invoice = new Invoice(
      id,
      props.organizationId,
      props.projectId,
      props.deliveryId,
      number,
      customerId,
      props.issueDate ? new Date(props.issueDate) : null,
      props.dueDate ? new Date(props.dueDate) : null,
      currency,
      zero,
      zero,
      zero,
      zero,
      zero,
      zero,
      zero,
      [],
      InvoiceStatus.DRAFT,
      null,
      now,
      now,
    );
    invoice.record(
      InvoiceCreated.create({
        organizationId: props.organizationId,
        invoiceId: id,
        invoiceNumber: number.value,
        projectId: props.projectId,
        deliveryId: props.deliveryId,
        status: InvoiceStatus.DRAFT,
        totalMinor: 0,
        currency: currency.code,
        occurredAt: now,
      }),
    );
    return invoice;
  }

  static reconstitute(snapshot: InvoiceSnapshot): Invoice {
    const currency = Currency.create(snapshot.currency);
    return new Invoice(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      snapshot.deliveryId,
      InvoiceNumber.create(snapshot.invoiceNumber),
      snapshot.customerId,
      snapshot.issueDate ? new Date(snapshot.issueDate) : null,
      snapshot.dueDate ? new Date(snapshot.dueDate) : null,
      currency,
      Money.fromMinorUnits(snapshot.subtotalMinor, currency),
      Money.fromMinorUnits(snapshot.taxMinor, currency),
      Money.fromMinorUnits(snapshot.discountMinor, currency),
      Money.fromMinorUnits(snapshot.totalMinor, currency),
      Money.fromMinorUnits(snapshot.balanceMinor, currency),
      Money.fromMinorUnits(snapshot.paidMinor, currency),
      Money.fromMinorUnits(snapshot.creditedMinor, currency),
      snapshot.lineIds as InvoiceLineId[],
      snapshot.status,
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
  get deliveryId(): DeliveryId {
    return this._deliveryId;
  }
  get invoiceNumber(): InvoiceNumber {
    return this._invoiceNumber;
  }
  get customerId(): string {
    return this._customerId;
  }
  get issueDate(): Date | null {
    return this._issueDate ? new Date(this._issueDate) : null;
  }
  get dueDate(): Date | null {
    return this._dueDate ? new Date(this._dueDate) : null;
  }
  get currency(): Currency {
    return this._currency;
  }
  get subtotal(): Money {
    return this._subtotal;
  }
  get tax(): Money {
    return this._tax;
  }
  get discount(): Money {
    return this._discount;
  }
  get total(): Money {
    return this._total;
  }
  get balance(): Money {
    return this._balance;
  }
  get paid(): Money {
    return this._paid;
  }
  get credited(): Money {
    return this._credited;
  }
  get lineIds(): readonly InvoiceLineId[] {
    return [...this._lineIds];
  }
  get status(): InvoiceStatus {
    return this._status;
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
  get isDraft(): boolean {
    return this._status === InvoiceStatus.DRAFT;
  }
  get isPaid(): boolean {
    return this._status === InvoiceStatus.PAID;
  }
  get isVoid(): boolean {
    return this._status === InvoiceStatus.VOID;
  }
  get isArchived(): boolean {
    return this._status === InvoiceStatus.ARCHIVED;
  }

  recalculateFromLines(lines: readonly InvoiceLine[], now: Date = new Date()): void {
    this.assertDraft();
    for (const line of lines) {
      if (line.invoiceId !== this.id) {
        throw new InvalidInvoiceStateError(
          `Line ${line.id} does not belong to invoice ${this.id}.`,
        );
      }
    }
    const totals = InvoiceCalculationPolicy.computeInvoiceTotals(
      lines.map((l) => l.toLineInput()),
      this._currency.code,
    );
    this._subtotal = totals.subtotal;
    this._tax = totals.tax;
    this._discount = totals.discount;
    this._total = totals.total;
    this._balance = totals.total.subtract(this._paid).subtract(this._credited);
    this._lineIds = lines.map((l) => l.id);
    this._updatedAt = now;
  }

  addLineId(lineId: InvoiceLineId, now: Date = new Date()): void {
    this.assertDraft();
    if (!this._lineIds.includes(lineId)) {
      this._lineIds = [...this._lineIds, lineId];
      this._updatedAt = now;
    }
  }

  removeLineId(lineId: InvoiceLineId, now: Date = new Date()): void {
    this.assertDraft();
    this._lineIds = this._lineIds.filter((id) => id !== lineId);
    this._updatedAt = now;
  }

  issue(now: Date = new Date()): void {
    this.assertMutable();
    if (this._status !== InvoiceStatus.DRAFT) {
      throw new InvalidInvoiceStateError(
        `Only DRAFT invoices can be issued (status: ${this._status}).`,
      );
    }
    if (this._lineIds.length === 0) {
      throw new InvalidInvoiceStateError(
        "Cannot issue invoice without lines.",
      );
    }
    this.transitionTo(InvoiceStatus.ISSUED, now);
    this._issueDate = this._issueDate ?? now;
    this.record(
      InvoiceIssued.create({
        organizationId: this._organizationId,
        invoiceId: this.id,
        issueDate: this._issueDate,
        occurredAt: now,
      }),
    );
  }

  /**
   * Apply a completed payment amount toward balance.
   */
  applyPayment(amount: Money, now: Date = new Date()): void {
    this.assertAcceptsPayment();
    amount.assertNonNegative("Payment");
    if (amount.currencyCode !== this._currency.code) {
      throw new InvalidInvoiceStateError("Payment currency mismatch.");
    }
    if (amount.greaterThan(this._balance)) {
      throw new InvalidInvoiceStateError(
        `Payment ${amount.minorUnits} exceeds balance ${this._balance.minorUnits}.`,
      );
    }
    this._paid = this._paid.add(amount);
    this._balance = this._total.subtract(this._paid).subtract(this._credited);
    this._updatedAt = now;
    this.updatePaymentStatus(now);
  }

  /**
   * Apply credit note amount toward balance.
   */
  applyCredit(amount: Money, now: Date = new Date()): void {
    this.assertAcceptsPayment();
    amount.assertNonNegative("Credit");
    if (amount.currencyCode !== this._currency.code) {
      throw new InvalidInvoiceStateError("Credit currency mismatch.");
    }
    if (amount.greaterThan(this._balance)) {
      throw new InvalidInvoiceStateError(
        `Credit ${amount.minorUnits} exceeds balance ${this._balance.minorUnits}.`,
      );
    }
    this._credited = this._credited.add(amount);
    this._balance = this._total.subtract(this._paid).subtract(this._credited);
    this._updatedAt = now;
    this.updatePaymentStatus(now);
  }

  /**
   * Reverse a completed payment (refund) — increases balance.
   * Allowed on ISSUED / PARTIALLY_PAID / PAID (not DRAFT, VOID, ARCHIVED).
   */
  reversePayment(amount: Money, now: Date = new Date()): void {
    this.assertMutable();
    if (
      this._status === InvoiceStatus.DRAFT ||
      this._status === InvoiceStatus.VOID
    ) {
      throw new InvalidInvoiceStateError(
        `Invoice in status ${this._status} cannot reverse payments.`,
      );
    }
    amount.assertNonNegative("Refund");
    if (amount.greaterThan(this._paid)) {
      throw new InvalidInvoiceStateError(
        "Refund cannot exceed paid amount.",
      );
    }
    this._paid = this._paid.subtract(amount);
    this._balance = this._total.subtract(this._paid).subtract(this._credited);
    this._updatedAt = now;
    if (this._balance.isZero) {
      this._status = InvoiceStatus.PAID;
    } else if (this._paid.isPositive || this._credited.isPositive) {
      this._status = InvoiceStatus.PARTIALLY_PAID;
    } else {
      this._status = InvoiceStatus.ISSUED;
    }
  }

  void(now: Date = new Date()): void {
    this.assertMutable();
    if (this._status === InvoiceStatus.PAID) {
      throw new InvoiceAlreadyPaidError(this.id);
    }
    if (this._status === InvoiceStatus.VOID) {
      throw new InvoiceAlreadyVoidedError(this.id);
    }
    if (
      this._status !== InvoiceStatus.ISSUED &&
      this._status !== InvoiceStatus.PARTIALLY_PAID
    ) {
      throw new InvalidInvoiceStateError(
        `Cannot void invoice in status ${this._status}.`,
      );
    }
    this.transitionTo(InvoiceStatus.VOID, now);
    this.record(
      InvoiceVoided.create({
        organizationId: this._organizationId,
        invoiceId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === InvoiceStatus.ARCHIVED) {
      throw new InvalidInvoiceStateError("Invoice already archived.");
    }
    this.transitionTo(InvoiceStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      InvoiceArchived.create({
        organizationId: this._organizationId,
        invoiceId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): InvoiceSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      deliveryId: this._deliveryId,
      invoiceNumber: this._invoiceNumber.value,
      customerId: this._customerId,
      issueDate: this.issueDate,
      dueDate: this.dueDate,
      currency: this._currency.code,
      subtotalMinor: this._subtotal.minorUnits,
      taxMinor: this._tax.minorUnits,
      discountMinor: this._discount.minorUnits,
      totalMinor: this._total.minorUnits,
      balanceMinor: this._balance.minorUnits,
      paidMinor: this._paid.minorUnits,
      creditedMinor: this._credited.minorUnits,
      lineIds: this._lineIds.map(String),
      status: this._status,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private updatePaymentStatus(now: Date): void {
    if (this._balance.isZero) {
      this._status = InvoiceStatus.PAID;
      this.record(
        InvoicePaid.create({
          organizationId: this._organizationId,
          invoiceId: this.id,
          occurredAt: now,
        }),
      );
    } else if (this._paid.isPositive || this._credited.isPositive) {
      this._status = InvoiceStatus.PARTIALLY_PAID;
      this.record(
        InvoicePartiallyPaid.create({
          organizationId: this._organizationId,
          invoiceId: this.id,
          balanceMinor: this._balance.minorUnits,
          occurredAt: now,
        }),
      );
    }
  }

  private transitionTo(to: InvoiceStatus, now: Date): void {
    if (this._status === InvoiceStatus.ARCHIVED) {
      throw new InvalidInvoiceStateError(
        "Archived invoices are immutable.",
      );
    }
    if (!canTransitionInvoice(this._status, to)) {
      throw new InvalidInvoiceStateError(
        `Cannot transition invoice from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertDraft(): void {
    this.assertMutable();
    if (this._status !== InvoiceStatus.DRAFT) {
      throw new InvalidInvoiceStateError(
        "Lines can only be modified while invoice is DRAFT.",
      );
    }
  }

  private assertMutable(): void {
    if (this._status === InvoiceStatus.ARCHIVED) {
      throw new InvalidInvoiceStateError(
        "Archived invoices are immutable.",
      );
    }
  }

  private assertAcceptsPayment(): void {
    this.assertMutable();
    if (
      this._status === InvoiceStatus.DRAFT ||
      this._status === InvoiceStatus.VOID ||
      this._status === InvoiceStatus.PAID
    ) {
      if (this._status === InvoiceStatus.PAID) {
        throw new InvoiceAlreadyPaidError(this.id);
      }
      throw new InvalidInvoiceStateError(
        `Invoice in status ${this._status} cannot accept payments/credits.`,
      );
    }
  }
}
