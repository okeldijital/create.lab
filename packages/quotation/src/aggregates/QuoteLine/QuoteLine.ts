import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import type { ServiceId } from "@creative-lab/services";
import { QuotationValidationError } from "../../errors/QuotationErrors.js";
import { QuoteLineAdded } from "../../events/quotation-events.js";
import { PricingPolicy } from "../../policies/PricingPolicy.js";
import {
  asQuoteLineId,
  type QuoteLineId,
  type QuoteVersionId,
} from "../../types/ids.js";
import { Money } from "../../value-objects/Money.js";
import { Quantity } from "../../value-objects/Quantity.js";
import { QuoteDescription } from "../../value-objects/QuoteDescription.js";

export type CreateQuoteLineProps = {
  organizationId: OrganizationId;
  quoteVersionId: QuoteVersionId;
  serviceId: ServiceId;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  currency: string;
  id?: string;
  now?: Date;
};

export type QuoteLineSnapshot = {
  id: QuoteLineId;
  organizationId: OrganizationId;
  quoteVersionId: QuoteVersionId;
  serviceId: ServiceId;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  currency: string;
  createdAt: Date;
};

/**
 * One commercial line. Totals via PricingPolicy. Service reference only.
 */
export class QuoteLine extends AggregateRoot<QuoteLineId> {
  private constructor(
    id: QuoteLineId,
    private readonly _organizationId: OrganizationId,
    private readonly _quoteVersionId: QuoteVersionId,
    private readonly _serviceId: ServiceId,
    private readonly _description: QuoteDescription,
    private readonly _quantity: Quantity,
    private readonly _unitPrice: Money,
    private readonly _lineTotal: Money,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateQuoteLineProps): QuoteLine {
    if (!props.quoteVersionId) {
      throw new QuotationValidationError("Line requires a quote version.");
    }
    if (!props.serviceId) {
      throw new QuotationValidationError("Line requires a service.");
    }
    const pricing = PricingPolicy.computeLineTotal({
      quantity: props.quantity,
      unitPriceMinor: props.unitPriceMinor,
      currency: props.currency,
    });
    const now = props.now ?? new Date();
    const id = asQuoteLineId(props.id ?? generateId());
    const line = new QuoteLine(
      id,
      props.organizationId,
      props.quoteVersionId,
      props.serviceId,
      QuoteDescription.create(props.description),
      pricing.quantity,
      pricing.unitPrice,
      pricing.lineTotal,
      now,
    );
    line.record(
      QuoteLineAdded.create({
        organizationId: props.organizationId,
        lineId: id,
        versionId: props.quoteVersionId,
        serviceId: props.serviceId,
        occurredAt: now,
      }),
    );
    return line;
  }

  static reconstitute(snapshot: QuoteLineSnapshot): QuoteLine {
    return new QuoteLine(
      snapshot.id,
      snapshot.organizationId,
      snapshot.quoteVersionId,
      snapshot.serviceId,
      QuoteDescription.create(snapshot.description),
      Quantity.create(snapshot.quantity),
      Money.fromMinorUnits(snapshot.unitPriceMinor, snapshot.currency),
      Money.fromMinorUnits(snapshot.lineTotalMinor, snapshot.currency),
      new Date(snapshot.createdAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get quoteVersionId(): QuoteVersionId {
    return this._quoteVersionId;
  }
  get serviceId(): ServiceId {
    return this._serviceId;
  }
  get description(): QuoteDescription {
    return this._description;
  }
  get quantity(): Quantity {
    return this._quantity;
  }
  get unitPrice(): Money {
    return this._unitPrice;
  }
  get lineTotal(): Money {
    return this._lineTotal;
  }
  get currencyCode(): string {
    return this._lineTotal.currencyCode;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPricingInput() {
    return {
      quantity: this._quantity.value,
      unitPriceMinor: this._unitPrice.minorUnits,
      currency: this._lineTotal.currencyCode,
    };
  }

  toSnapshot(): QuoteLineSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      quoteVersionId: this._quoteVersionId,
      serviceId: this._serviceId,
      description: this._description.value,
      quantity: this._quantity.value,
      unitPriceMinor: this._unitPrice.minorUnits,
      lineTotalMinor: this._lineTotal.minorUnits,
      currency: this._lineTotal.currencyCode,
      createdAt: this.createdAt,
    };
  }
}
