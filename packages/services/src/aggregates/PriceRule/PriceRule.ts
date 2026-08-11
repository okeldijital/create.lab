import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { PriceRuleStatus } from "../../enums/PriceRuleStatus.js";
import { InvalidServiceStateError } from "../../errors/ServicesErrors.js";
import {
  PriceRuleArchived,
  PriceRuleCreated,
  PriceRuleUpdated,
} from "../../events/services-events.js";
import {
  asPriceRuleId,
  type PriceBookId,
  type PriceRuleId,
  type ServiceId,
} from "../../types/ids.js";
import { PriceRange } from "../../value-objects/PriceRange.js";

export type CreatePriceRuleProps = {
  organizationId: OrganizationId;
  priceBookId: PriceBookId;
  serviceId: ServiceId;
  basePriceMinor: number;
  minimumPriceMinor?: number;
  maximumPriceMinor?: number;
  currency: string;
  id?: string;
  now?: Date;
};

export type PriceRuleSnapshot = {
  id: PriceRuleId;
  organizationId: OrganizationId;
  priceBookId: PriceBookId;
  serviceId: ServiceId;
  basePriceMinor: number;
  minimumPriceMinor: number;
  maximumPriceMinor: number;
  currency: string;
  status: PriceRuleStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Pricing of one service within a price book.
 * minimum ≤ base ≤ maximum; one active rule per service per book (service layer).
 */
export class PriceRule extends AggregateRoot<PriceRuleId> {
  private constructor(
    id: PriceRuleId,
    private readonly _organizationId: OrganizationId,
    private readonly _priceBookId: PriceBookId,
    private readonly _serviceId: ServiceId,
    private _range: PriceRange,
    private _status: PriceRuleStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreatePriceRuleProps): PriceRule {
    if (!props.priceBookId) {
      throw new InvalidServiceStateError("Price rule requires a price book.");
    }
    if (!props.serviceId) {
      throw new InvalidServiceStateError("Price rule requires a service.");
    }
    const min = props.minimumPriceMinor ?? props.basePriceMinor;
    const max = props.maximumPriceMinor ?? props.basePriceMinor;
    const range = PriceRange.create({
      baseMinor: props.basePriceMinor,
      minimumMinor: min,
      maximumMinor: max,
      currency: props.currency,
    });
    const now = props.now ?? new Date();
    const id = asPriceRuleId(props.id ?? generateId());
    const rule = new PriceRule(
      id,
      props.organizationId,
      props.priceBookId,
      props.serviceId,
      range,
      PriceRuleStatus.ACTIVE,
      now,
      now,
      null,
    );
    rule.record(
      PriceRuleCreated.create({
        organizationId: props.organizationId,
        priceRuleId: id,
        priceBookId: props.priceBookId,
        serviceId: props.serviceId,
        basePriceMinor: range.base.minorUnits,
        occurredAt: now,
      }),
    );
    return rule;
  }

  static reconstitute(snapshot: PriceRuleSnapshot): PriceRule {
    return new PriceRule(
      snapshot.id,
      snapshot.organizationId,
      snapshot.priceBookId,
      snapshot.serviceId,
      PriceRange.create({
        baseMinor: snapshot.basePriceMinor,
        minimumMinor: snapshot.minimumPriceMinor,
        maximumMinor: snapshot.maximumPriceMinor,
        currency: snapshot.currency,
      }),
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get priceBookId(): PriceBookId {
    return this._priceBookId;
  }
  get serviceId(): ServiceId {
    return this._serviceId;
  }
  get range(): PriceRange {
    return this._range;
  }
  get basePrice() {
    return this._range.base;
  }
  get minimumPrice() {
    return this._range.minimum;
  }
  get maximumPrice() {
    return this._range.maximum;
  }
  get currencyCode(): string {
    return this._range.currencyCode;
  }
  get status(): PriceRuleStatus {
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
  get isActive(): boolean {
    return this._status === PriceRuleStatus.ACTIVE;
  }
  get isArchived(): boolean {
    return this._status === PriceRuleStatus.ARCHIVED;
  }

  updatePricing(
    input: {
      basePriceMinor: number;
      minimumPriceMinor?: number;
      maximumPriceMinor?: number;
    },
    now: Date = new Date(),
  ): void {
    this.assertMutable();
    const min = input.minimumPriceMinor ?? input.basePriceMinor;
    const max = input.maximumPriceMinor ?? input.basePriceMinor;
    this._range = PriceRange.create({
      baseMinor: input.basePriceMinor,
      minimumMinor: min,
      maximumMinor: max,
      currency: this._range.currencyCode,
    });
    this._updatedAt = now;
    this.record(
      PriceRuleUpdated.create({
        organizationId: this._organizationId,
        priceRuleId: this.id,
        basePriceMinor: this._range.base.minorUnits,
        minimumPriceMinor: this._range.minimum.minorUnits,
        maximumPriceMinor: this._range.maximum.minorUnits,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === PriceRuleStatus.ARCHIVED) {
      throw new InvalidServiceStateError("Price rule already archived.");
    }
    this._status = PriceRuleStatus.ARCHIVED;
    this._archivedAt = now;
    this._updatedAt = now;
    this.record(
      PriceRuleArchived.create({
        organizationId: this._organizationId,
        priceRuleId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): PriceRuleSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      priceBookId: this._priceBookId,
      serviceId: this._serviceId,
      basePriceMinor: this._range.base.minorUnits,
      minimumPriceMinor: this._range.minimum.minorUnits,
      maximumPriceMinor: this._range.maximum.minorUnits,
      currency: this._range.currencyCode,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private assertMutable(): void {
    if (this._status === PriceRuleStatus.ARCHIVED) {
      throw new InvalidServiceStateError(
        "Archived price rules are immutable.",
      );
    }
  }
}
