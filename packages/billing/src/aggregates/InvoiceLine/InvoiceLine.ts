import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { BillingValidationError } from "../../errors/BillingErrors.js";
import { InvoiceCalculationPolicy } from "../../policies/InvoiceCalculationPolicy.js";
import {
  asInvoiceLineId,
  type InvoiceId,
  type InvoiceLineId,
} from "../../types/ids.js";
import { InvoiceDescription } from "../../value-objects/InvoiceDescription.js";
import { Money } from "../../value-objects/Money.js";

export type CreateInvoiceLineProps = {
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  discountMinor?: number;
  taxRate?: number;
  currency: string;
  id?: string;
  now?: Date;
};

export type InvoiceLineSnapshot = {
  id: InvoiceLineId;
  organizationId: OrganizationId;
  invoiceId: InvoiceId;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  discountMinor: number;
  taxRate: number;
  lineTotalMinor: number;
  currency: string;
  createdAt: Date;
};

/**
 * One commercial line. Totals computed and immutable after create.
 */
export class InvoiceLine extends AggregateRoot<InvoiceLineId> {
  private constructor(
    id: InvoiceLineId,
    private readonly _organizationId: OrganizationId,
    private readonly _invoiceId: InvoiceId,
    private readonly _description: InvoiceDescription,
    private readonly _quantity: number,
    private readonly _unitPrice: Money,
    private readonly _discount: Money,
    private readonly _taxRate: number,
    private readonly _lineTotal: Money,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateInvoiceLineProps): InvoiceLine {
    if (!props.invoiceId) {
      throw new BillingValidationError("Line requires an invoice.");
    }
    const discountMinor = props.discountMinor ?? 0;
    const taxRate = props.taxRate ?? 0;
    const totals = InvoiceCalculationPolicy.computeLineTotal({
      quantity: props.quantity,
      unitPriceMinor: props.unitPriceMinor,
      discountMinor,
      taxRate,
      currency: props.currency,
    });
    const now = props.now ?? new Date();
    const id = asInvoiceLineId(props.id ?? generateId());
    return new InvoiceLine(
      id,
      props.organizationId,
      props.invoiceId,
      InvoiceDescription.create(props.description),
      props.quantity,
      Money.fromMinorUnits(props.unitPriceMinor, props.currency),
      Money.fromMinorUnits(discountMinor, props.currency),
      taxRate,
      totals.lineTotal,
      now,
    );
  }

  static reconstitute(snapshot: InvoiceLineSnapshot): InvoiceLine {
    return new InvoiceLine(
      snapshot.id,
      snapshot.organizationId,
      snapshot.invoiceId,
      InvoiceDescription.create(snapshot.description),
      snapshot.quantity,
      Money.fromMinorUnits(snapshot.unitPriceMinor, snapshot.currency),
      Money.fromMinorUnits(snapshot.discountMinor, snapshot.currency),
      snapshot.taxRate,
      Money.fromMinorUnits(snapshot.lineTotalMinor, snapshot.currency),
      new Date(snapshot.createdAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get invoiceId(): InvoiceId {
    return this._invoiceId;
  }
  get description(): InvoiceDescription {
    return this._description;
  }
  get quantity(): number {
    return this._quantity;
  }
  get unitPrice(): Money {
    return this._unitPrice;
  }
  get discount(): Money {
    return this._discount;
  }
  get taxRate(): number {
    return this._taxRate;
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

  toLineInput() {
    return {
      quantity: this._quantity,
      unitPriceMinor: this._unitPrice.minorUnits,
      discountMinor: this._discount.minorUnits,
      taxRate: this._taxRate,
      currency: this._lineTotal.currencyCode,
    };
  }

  toSnapshot(): InvoiceLineSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      invoiceId: this._invoiceId,
      description: this._description.value,
      quantity: this._quantity,
      unitPriceMinor: this._unitPrice.minorUnits,
      discountMinor: this._discount.minorUnits,
      taxRate: this._taxRate,
      lineTotalMinor: this._lineTotal.minorUnits,
      currency: this._lineTotal.currencyCode,
      createdAt: this.createdAt,
    };
  }
}
