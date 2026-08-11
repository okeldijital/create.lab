import { AggregateRoot, generateId } from "@creative-lab/core";
import type { CustomerId, OpportunityId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import {
  QuoteStatus,
  canTransitionQuote,
} from "../../enums/QuoteStatus.js";
import {
  InvalidQuoteStateError,
  QuoteAlreadyAcceptedError,
} from "../../errors/QuotationErrors.js";
import {
  QuoteAccepted,
  QuoteArchived,
  QuoteCreated,
  QuoteDeclined,
  QuoteExpired,
  QuoteIssued,
} from "../../events/quotation-events.js";
import {
  asQuoteId,
  type QuoteId,
  type QuoteVersionId,
} from "../../types/ids.js";
import { Currency } from "../../value-objects/Currency.js";
import { QuoteNumber } from "../../value-objects/QuoteNumber.js";
import { ValidityPeriod } from "../../value-objects/ValidityPeriod.js";

export type CreateQuoteProps = {
  organizationId: OrganizationId;
  customerId: CustomerId;
  opportunityId?: OpportunityId | null;
  currency?: string;
  quoteNumber?: string;
  validUntil?: Date | null;
  id?: string;
  now?: Date;
};

export type QuoteSnapshot = {
  id: QuoteId;
  organizationId: OrganizationId;
  quoteNumber: string;
  customerId: CustomerId;
  opportunityId: string | null;
  currency: string;
  status: QuoteStatus;
  currentVersionId: string | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Commercial proposal. quoteNumber/customer/currency immutable.
 * Exactly one current version tracked via currentVersionId.
 */
export class Quote extends AggregateRoot<QuoteId> {
  private constructor(
    id: QuoteId,
    private readonly _organizationId: OrganizationId,
    private readonly _quoteNumber: QuoteNumber,
    private readonly _customerId: CustomerId,
    private readonly _opportunityId: OpportunityId | null,
    private readonly _currency: Currency,
    private _status: QuoteStatus,
    private _currentVersionId: QuoteVersionId | null,
    private _validity: ValidityPeriod,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateQuoteProps): Quote {
    if (!props.organizationId) {
      throw new InvalidQuoteStateError("Quote requires an organization.");
    }
    if (!props.customerId) {
      throw new InvalidQuoteStateError("Quote requires a customer.");
    }
    const now = props.now ?? new Date();
    const id = asQuoteId(props.id ?? generateId());
    const number = props.quoteNumber
      ? QuoteNumber.create(props.quoteNumber)
      : QuoteNumber.generate(now);
    const quote = new Quote(
      id,
      props.organizationId,
      number,
      props.customerId,
      props.opportunityId ?? null,
      Currency.create(props.currency ?? "USD"),
      QuoteStatus.DRAFT,
      null,
      ValidityPeriod.create(props.validUntil),
      now,
      now,
      null,
    );
    quote.record(
      QuoteCreated.create({
        organizationId: props.organizationId,
        quoteId: id,
        quoteNumber: number.value,
        customerId: props.customerId,
        status: QuoteStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return quote;
  }

  static reconstitute(snapshot: QuoteSnapshot): Quote {
    return new Quote(
      snapshot.id,
      snapshot.organizationId,
      QuoteNumber.create(snapshot.quoteNumber),
      snapshot.customerId,
      (snapshot.opportunityId as OpportunityId | null) ?? null,
      Currency.create(snapshot.currency),
      snapshot.status,
      (snapshot.currentVersionId as QuoteVersionId | null) ?? null,
      ValidityPeriod.create(snapshot.validUntil),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get quoteNumber(): QuoteNumber {
    return this._quoteNumber;
  }
  get customerId(): CustomerId {
    return this._customerId;
  }
  get opportunityId(): OpportunityId | null {
    return this._opportunityId;
  }
  get currency(): Currency {
    return this._currency;
  }
  get status(): QuoteStatus {
    return this._status;
  }
  get currentVersionId(): QuoteVersionId | null {
    return this._currentVersionId;
  }
  get validUntil(): Date | null {
    return this._validity.validUntil;
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
    return this._status === QuoteStatus.DRAFT;
  }
  get isIssued(): boolean {
    return this._status === QuoteStatus.ISSUED;
  }
  get isAccepted(): boolean {
    return this._status === QuoteStatus.ACCEPTED;
  }
  get isArchived(): boolean {
    return this._status === QuoteStatus.ARCHIVED;
  }

  isPastValidUntil(now: Date = new Date()): boolean {
    return this._validity.isExpired(now);
  }

  setCurrentVersion(
    versionId: QuoteVersionId,
    now: Date = new Date(),
  ): void {
    this.assertMutable();
    this._currentVersionId = versionId;
    this._updatedAt = now;
  }

  setValidUntil(validUntil: Date | null, now: Date = new Date()): void {
    this.assertDraft();
    this._validity = ValidityPeriod.create(validUntil);
    this._updatedAt = now;
  }

  issue(now: Date = new Date()): void {
    this.assertMutable();
    if (this._status !== QuoteStatus.DRAFT) {
      throw new InvalidQuoteStateError(
        `Only DRAFT quotes can be issued (status: ${this._status}).`,
      );
    }
    if (!this._currentVersionId) {
      throw new InvalidQuoteStateError(
        "Cannot issue quote without a current version.",
      );
    }
    this.transitionTo(QuoteStatus.ISSUED, now);
    this.record(
      QuoteIssued.create({
        organizationId: this._organizationId,
        quoteId: this.id,
        versionId: this._currentVersionId,
        occurredAt: now,
      }),
    );
  }

  accept(now: Date = new Date()): void {
    this.assertMutable();
    if (this._status === QuoteStatus.ACCEPTED) {
      throw new QuoteAlreadyAcceptedError(this.id);
    }
    this.transitionTo(QuoteStatus.ACCEPTED, now);
    this.record(
      QuoteAccepted.create({
        organizationId: this._organizationId,
        quoteId: this.id,
        occurredAt: now,
      }),
    );
  }

  decline(now: Date = new Date()): void {
    this.assertMutable();
    this.transitionTo(QuoteStatus.DECLINED, now);
    this.record(
      QuoteDeclined.create({
        organizationId: this._organizationId,
        quoteId: this.id,
        occurredAt: now,
      }),
    );
  }

  expire(now: Date = new Date()): void {
    this.assertMutable();
    this.transitionTo(QuoteStatus.EXPIRED, now);
    this.record(
      QuoteExpired.create({
        organizationId: this._organizationId,
        quoteId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === QuoteStatus.ARCHIVED) {
      throw new InvalidQuoteStateError("Quote already archived.");
    }
    this.transitionTo(QuoteStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      QuoteArchived.create({
        organizationId: this._organizationId,
        quoteId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): QuoteSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      quoteNumber: this._quoteNumber.value,
      customerId: this._customerId,
      opportunityId: this._opportunityId,
      currency: this._currency.code,
      status: this._status,
      currentVersionId: this._currentVersionId,
      validUntil: this.validUntil,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: QuoteStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionQuote(this._status, to)) {
      throw new InvalidQuoteStateError(
        `Cannot transition quote from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertDraft(): void {
    this.assertMutable();
    if (this._status !== QuoteStatus.DRAFT) {
      throw new InvalidQuoteStateError(
        "Only DRAFT quotes can change validity.",
      );
    }
  }

  private assertMutable(): void {
    if (this._status === QuoteStatus.ARCHIVED) {
      throw new InvalidQuoteStateError("Archived quotes are immutable.");
    }
  }
}
