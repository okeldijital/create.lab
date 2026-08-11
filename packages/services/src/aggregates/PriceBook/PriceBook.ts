import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  PriceBookStatus,
  canTransitionPriceBook,
} from "../../enums/PriceBookStatus.js";
import { InvalidServiceStateError } from "../../errors/ServicesErrors.js";
import {
  PriceBookCreated,
  PriceBookPublished,
  PriceBookRetired,
} from "../../events/services-events.js";
import { asPriceBookId, type PriceBookId } from "../../types/ids.js";
import { Currency } from "../../value-objects/Currency.js";
import { PriceBookName } from "../../value-objects/PriceBookName.js";

export type CreatePriceBookProps = {
  organizationId: OrganizationId;
  name: string;
  currency?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  id?: string;
  now?: Date;
};

export type PriceBookSnapshot = {
  id: PriceBookId;
  organizationId: OrganizationId;
  name: string;
  currency: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  status: PriceBookStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Published collection of prices. Currency immutable.
 * Effective period immutable after publish.
 */
export class PriceBook extends AggregateRoot<PriceBookId> {
  private constructor(
    id: PriceBookId,
    private readonly _organizationId: OrganizationId,
    private _name: PriceBookName,
    private readonly _currency: Currency,
    private _effectiveFrom: Date,
    private _effectiveTo: Date | null,
    private _status: PriceBookStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreatePriceBookProps): PriceBook {
    if (!props.organizationId) {
      throw new InvalidServiceStateError(
        "Price book requires an organization.",
      );
    }
    const now = props.now ?? new Date();
    const id = asPriceBookId(props.id ?? generateId());
    const effectiveFrom = props.effectiveFrom
      ? new Date(props.effectiveFrom)
      : now;
    const effectiveTo = props.effectiveTo
      ? new Date(props.effectiveTo)
      : null;
    if (effectiveTo && effectiveTo.getTime() < effectiveFrom.getTime()) {
      throw new InvalidServiceStateError(
        "effectiveTo must be on or after effectiveFrom.",
      );
    }
    const book = new PriceBook(
      id,
      props.organizationId,
      PriceBookName.create(props.name),
      Currency.create(props.currency ?? "USD"),
      effectiveFrom,
      effectiveTo,
      PriceBookStatus.DRAFT,
      now,
      now,
      null,
    );
    book.record(
      PriceBookCreated.create({
        organizationId: props.organizationId,
        priceBookId: id,
        name: book.name.value,
        currency: book.currency.code,
        status: PriceBookStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return book;
  }

  static reconstitute(snapshot: PriceBookSnapshot): PriceBook {
    return new PriceBook(
      snapshot.id,
      snapshot.organizationId,
      PriceBookName.create(snapshot.name),
      Currency.create(snapshot.currency),
      new Date(snapshot.effectiveFrom),
      snapshot.effectiveTo ? new Date(snapshot.effectiveTo) : null,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): PriceBookName {
    return this._name;
  }
  get currency(): Currency {
    return this._currency;
  }
  get effectiveFrom(): Date {
    return new Date(this._effectiveFrom);
  }
  get effectiveTo(): Date | null {
    return this._effectiveTo ? new Date(this._effectiveTo) : null;
  }
  get status(): PriceBookStatus {
    return this._status;
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
    return this._status === PriceBookStatus.DRAFT;
  }
  get isPublished(): boolean {
    return this._status === PriceBookStatus.PUBLISHED;
  }
  get isArchived(): boolean {
    return this._status === PriceBookStatus.ARCHIVED;
  }

  setEffectivePeriod(
    from: Date,
    to: Date | null,
    now: Date = new Date(),
  ): void {
    this.assertDraft();
    if (to && to.getTime() < from.getTime()) {
      throw new InvalidServiceStateError(
        "effectiveTo must be on or after effectiveFrom.",
      );
    }
    this._effectiveFrom = new Date(from);
    this._effectiveTo = to ? new Date(to) : null;
    this._updatedAt = now;
  }

  publish(now: Date = new Date()): void {
    this.transitionTo(PriceBookStatus.PUBLISHED, now);
    this.record(
      PriceBookPublished.create({
        organizationId: this._organizationId,
        priceBookId: this.id,
        currency: this._currency.code,
        occurredAt: now,
      }),
    );
  }

  retire(now: Date = new Date()): void {
    this.transitionTo(PriceBookStatus.RETIRED, now);
    this.record(
      PriceBookRetired.create({
        organizationId: this._organizationId,
        priceBookId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === PriceBookStatus.ARCHIVED) {
      throw new InvalidServiceStateError("Price book already archived.");
    }
    this.transitionTo(PriceBookStatus.ARCHIVED, now);
    this._archivedAt = now;
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertMutable();
    if (this._status !== PriceBookStatus.DRAFT) {
      throw new InvalidServiceStateError(
        "Only DRAFT price books can be renamed.",
      );
    }
    this._name = PriceBookName.create(name);
    this._updatedAt = now;
  }

  toSnapshot(): PriceBookSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      currency: this._currency.code,
      effectiveFrom: this.effectiveFrom,
      effectiveTo: this.effectiveTo,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: PriceBookStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionPriceBook(this._status, to)) {
      throw new InvalidServiceStateError(
        `Cannot transition price book from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertDraft(): void {
    this.assertMutable();
    if (this._status !== PriceBookStatus.DRAFT) {
      throw new InvalidServiceStateError(
        "Effective period is immutable after publish.",
      );
    }
  }

  private assertMutable(): void {
    if (this._status === PriceBookStatus.ARCHIVED) {
      throw new InvalidServiceStateError(
        "Archived price books are immutable.",
      );
    }
  }
}
