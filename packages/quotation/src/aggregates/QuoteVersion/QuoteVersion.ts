import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { QuoteVersionStatus } from "../../enums/QuoteVersionStatus.js";
import { InvalidQuoteStateError } from "../../errors/QuotationErrors.js";
import {
  QuoteVersionCreated,
  QuoteVersionPromoted,
} from "../../events/quotation-events.js";
import { PricingPolicy } from "../../policies/PricingPolicy.js";
import {
  asQuoteVersionId,
  type QuoteId,
  type QuoteLineId,
  type QuoteVersionId,
} from "../../types/ids.js";
import { Discount } from "../../value-objects/Discount.js";
import { Money } from "../../value-objects/Money.js";
import type { QuoteLine } from "../QuoteLine/QuoteLine.js";

export type CreateQuoteVersionProps = {
  organizationId: OrganizationId;
  quoteId: QuoteId;
  versionNumber: number;
  currency: string;
  discountMinor?: number;
  id?: string;
  now?: Date;
};

export type QuoteVersionSnapshot = {
  id: QuoteVersionId;
  organizationId: OrganizationId;
  quoteId: QuoteId;
  versionNumber: number;
  lineIds: string[];
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  status: QuoteVersionStatus;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * One revision of a quote. Locked (immutable) after quote issue.
 */
export class QuoteVersion extends AggregateRoot<QuoteVersionId> {
  private constructor(
    id: QuoteVersionId,
    private readonly _organizationId: OrganizationId,
    private readonly _quoteId: QuoteId,
    private readonly _versionNumber: number,
    private _lineIds: QuoteLineId[],
    private _subtotal: Money,
    private _discount: Discount,
    private _total: Money,
    private readonly _currency: string,
    private _status: QuoteVersionStatus,
    private _locked: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateQuoteVersionProps): QuoteVersion {
    if (!props.quoteId) {
      throw new InvalidQuoteStateError("Version requires a quote.");
    }
    if (!Number.isInteger(props.versionNumber) || props.versionNumber < 1) {
      throw new InvalidQuoteStateError(
        "Version number must be a positive integer.",
      );
    }
    const now = props.now ?? new Date();
    const id = asQuoteVersionId(props.id ?? generateId());
    const zero = Money.zero(props.currency);
    const discount = Discount.fromMinorUnits(
      props.discountMinor ?? 0,
      props.currency,
    );
    const version = new QuoteVersion(
      id,
      props.organizationId,
      props.quoteId,
      props.versionNumber,
      [],
      zero,
      discount,
      zero,
      props.currency,
      QuoteVersionStatus.CURRENT,
      false,
      now,
      now,
    );
    version.record(
      QuoteVersionCreated.create({
        organizationId: props.organizationId,
        versionId: id,
        quoteId: props.quoteId,
        versionNumber: props.versionNumber,
        occurredAt: now,
      }),
    );
    return version;
  }

  static reconstitute(snapshot: QuoteVersionSnapshot): QuoteVersion {
    return new QuoteVersion(
      snapshot.id,
      snapshot.organizationId,
      snapshot.quoteId,
      snapshot.versionNumber,
      snapshot.lineIds as QuoteLineId[],
      Money.fromMinorUnits(snapshot.subtotalMinor, snapshot.currency),
      Discount.fromMinorUnits(snapshot.discountMinor, snapshot.currency),
      Money.fromMinorUnits(snapshot.totalMinor, snapshot.currency),
      snapshot.currency,
      snapshot.status,
      snapshot.locked,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get quoteId(): QuoteId {
    return this._quoteId;
  }
  get versionNumber(): number {
    return this._versionNumber;
  }
  get lineIds(): readonly QuoteLineId[] {
    return [...this._lineIds];
  }
  get subtotal(): Money {
    return this._subtotal;
  }
  get discount(): Discount {
    return this._discount;
  }
  get total(): Money {
    return this._total;
  }
  get currencyCode(): string {
    return this._currency;
  }
  get status(): QuoteVersionStatus {
    return this._status;
  }
  get locked(): boolean {
    return this._locked;
  }
  get isCurrent(): boolean {
    return this._status === QuoteVersionStatus.CURRENT;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  recalculateFromLines(
    lines: readonly QuoteLine[],
    discountMinor?: number,
    now: Date = new Date(),
  ): void {
    this.assertEditable();
    for (const line of lines) {
      if (line.quoteVersionId !== this.id) {
        throw new InvalidQuoteStateError(
          `Line ${line.id} does not belong to version ${this.id}.`,
        );
      }
    }
    const totals = PricingPolicy.computeVersionTotals(
      lines.map((l) => l.toPricingInput()),
      discountMinor ?? this._discount.minorUnits,
      this._currency,
    );
    this._subtotal = totals.subtotal;
    this._discount = totals.discount;
    this._total = totals.total;
    this._lineIds = lines.map((l) => l.id);
    this._updatedAt = now;
  }

  addLineId(lineId: QuoteLineId, now: Date = new Date()): void {
    this.assertEditable();
    if (!this._lineIds.includes(lineId)) {
      this._lineIds = [...this._lineIds, lineId];
      this._updatedAt = now;
    }
  }

  removeLineId(lineId: QuoteLineId, now: Date = new Date()): void {
    this.assertEditable();
    this._lineIds = this._lineIds.filter((id) => id !== lineId);
    this._updatedAt = now;
  }

  setDiscount(discountMinor: number, now: Date = new Date()): void {
    this.assertEditable();
    this._discount = Discount.fromMinorUnits(discountMinor, this._currency);
    this._updatedAt = now;
  }

  lock(now: Date = new Date()): void {
    this._locked = true;
    this._updatedAt = now;
  }

  supersede(now: Date = new Date()): void {
    this._status = QuoteVersionStatus.SUPERSEDED;
    this._locked = true;
    this._updatedAt = now;
  }

  promote(
    previousVersionId: QuoteVersionId | null,
    now: Date = new Date(),
  ): void {
    this._status = QuoteVersionStatus.CURRENT;
    this._updatedAt = now;
    this.record(
      QuoteVersionPromoted.create({
        organizationId: this._organizationId,
        versionId: this.id,
        quoteId: this._quoteId,
        previousVersionId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): QuoteVersionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      quoteId: this._quoteId,
      versionNumber: this._versionNumber,
      lineIds: this._lineIds.map(String),
      subtotalMinor: this._subtotal.minorUnits,
      discountMinor: this._discount.minorUnits,
      totalMinor: this._total.minorUnits,
      currency: this._currency,
      status: this._status,
      locked: this._locked,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertEditable(): void {
    if (this._locked) {
      throw new InvalidQuoteStateError(
        "Locked quote versions are immutable.",
      );
    }
    if (this._status === QuoteVersionStatus.SUPERSEDED) {
      throw new InvalidQuoteStateError(
        "Superseded versions cannot be edited.",
      );
    }
  }
}
