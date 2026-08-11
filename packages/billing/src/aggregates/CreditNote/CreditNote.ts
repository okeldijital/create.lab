import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { CreditStatus } from "../../enums/CreditStatus.js";
import {
  CreditLimitExceededError,
  InvalidInvoiceStateError,
} from "../../errors/BillingErrors.js";
import {
  CreditNoteApplied,
  CreditNoteArchived,
  CreditNoteCreated,
  CreditNoteIssued,
} from "../../events/billing-events.js";
import {
  asCreditNoteId,
  type CreditNoteId,
  type InvoiceId,
} from "../../types/ids.js";
import { BillingReason } from "../../value-objects/BillingReason.js";
import { CreditReference } from "../../value-objects/CreditReference.js";
import { Money } from "../../value-objects/Money.js";

export type CreateCreditNoteProps = {
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  reference?: string;
  reason: string;
  amountMinor: number;
  currency: string;
  id?: string;
  now?: Date;
};

export type CreditNoteSnapshot = {
  id: CreditNoteId;
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  reference: string;
  reason: string;
  amountMinor: number;
  currency: string;
  status: CreditStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Reduction of an invoice. Cannot apply twice.
 */
export class CreditNote extends AggregateRoot<CreditNoteId> {
  private constructor(
    id: CreditNoteId,
    private readonly _organizationId: OrganizationId,
    private readonly _invoiceId: InvoiceId,
    private readonly _reference: CreditReference,
    private readonly _reason: BillingReason,
    private readonly _amount: Money,
    private _status: CreditStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateCreditNoteProps): CreditNote {
    if (!props.invoiceId) {
      throw new InvalidInvoiceStateError("Credit note requires an invoice.");
    }
    const amount = Money.fromMinorUnits(props.amountMinor, props.currency);
    amount.assertNonNegative("Credit amount");
    if (amount.isZero) {
      throw new InvalidInvoiceStateError("Credit amount must be > 0.");
    }
    const now = props.now ?? new Date();
    const id = asCreditNoteId(props.id ?? generateId());
    const reference = props.reference
      ? CreditReference.create(props.reference)
      : CreditReference.generate(now);
    const note = new CreditNote(
      id,
      props.organizationId,
      props.invoiceId,
      reference,
      BillingReason.create(props.reason),
      amount,
      CreditStatus.DRAFT,
      now,
      now,
    );
    note.record(
      CreditNoteCreated.create({
        organizationId: props.organizationId,
        creditNoteId: id,
        invoiceId: props.invoiceId,
        amountMinor: amount.minorUnits,
        status: CreditStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return note;
  }

  static reconstitute(snapshot: CreditNoteSnapshot): CreditNote {
    return new CreditNote(
      snapshot.id,
      snapshot.organizationId,
      snapshot.invoiceId,
      CreditReference.create(snapshot.reference),
      BillingReason.create(snapshot.reason),
      Money.fromMinorUnits(snapshot.amountMinor, snapshot.currency),
      snapshot.status,
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
  get reference(): CreditReference {
    return this._reference;
  }
  get reason(): BillingReason {
    return this._reason;
  }
  get amount(): Money {
    return this._amount;
  }
  get status(): CreditStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isApplied(): boolean {
    return this._status === CreditStatus.APPLIED;
  }

  issue(now: Date = new Date()): void {
    if (this._status !== CreditStatus.DRAFT) {
      throw new InvalidInvoiceStateError(
        `Only DRAFT credit notes can be issued (status: ${this._status}).`,
      );
    }
    this._status = CreditStatus.ISSUED;
    this._updatedAt = now;
    this.record(
      CreditNoteIssued.create({
        organizationId: this._organizationId,
        creditNoteId: this.id,
        invoiceId: this._invoiceId,
        occurredAt: now,
      }),
    );
  }

  apply(now: Date = new Date()): void {
    if (this._status === CreditStatus.APPLIED) {
      throw new CreditLimitExceededError(
        "Credit note has already been applied.",
      );
    }
    if (this._status !== CreditStatus.ISSUED) {
      throw new InvalidInvoiceStateError(
        `Only ISSUED credit notes can be applied (status: ${this._status}).`,
      );
    }
    this._status = CreditStatus.APPLIED;
    this._updatedAt = now;
    this.record(
      CreditNoteApplied.create({
        organizationId: this._organizationId,
        creditNoteId: this.id,
        invoiceId: this._invoiceId,
        amountMinor: this._amount.minorUnits,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === CreditStatus.ARCHIVED) {
      throw new InvalidInvoiceStateError("Credit note already archived.");
    }
    this._status = CreditStatus.ARCHIVED;
    this._updatedAt = now;
    this.record(
      CreditNoteArchived.create({
        organizationId: this._organizationId,
        creditNoteId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): CreditNoteSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      invoiceId: this._invoiceId,
      reference: this._reference.value,
      reason: this._reason.value,
      amountMinor: this._amount.minorUnits,
      currency: this._amount.currencyCode,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
