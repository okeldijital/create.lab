import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  CustomerStatus,
  canTransitionCustomer,
} from "../../enums/CustomerStatus.js";
import { InvalidCustomerStateError } from "../../errors/CRMErrors.js";
import {
  CustomerActivated,
  CustomerArchived,
  CustomerCreated,
} from "../../events/crm-events.js";
import { asCustomerId, type CustomerId } from "../../types/ids.js";
import { BillingAddress } from "../../value-objects/BillingAddress.js";
import { CustomerName } from "../../value-objects/CustomerName.js";
import { CustomerNumber } from "../../value-objects/CustomerNumber.js";
import { Industry } from "../../value-objects/Industry.js";
import { LegalName } from "../../value-objects/LegalName.js";

export type CreateCustomerProps = {
  organizationId: OrganizationId;
  name: string;
  customerNumber?: string;
  legalName?: string | null;
  industry?: string | null;
  billingAddress?: string | null;
  id?: string;
  now?: Date;
};

export type CustomerSnapshot = {
  id: CustomerId;
  organizationId: OrganizationId;
  customerNumber: string;
  name: string;
  legalName: string | null;
  status: CustomerStatus;
  industry: string | null;
  billingAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Business customer. Customer number and organization immutable.
 * Legal name optional; once ACTIVE it becomes immutable.
 */
export class Customer extends AggregateRoot<CustomerId> {
  private constructor(
    id: CustomerId,
    private readonly _organizationId: OrganizationId,
    private readonly _customerNumber: CustomerNumber,
    private _name: CustomerName,
    private _legalName: LegalName,
    private _status: CustomerStatus,
    private _industry: Industry,
    private _billingAddress: BillingAddress,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateCustomerProps): Customer {
    if (!props.organizationId) {
      throw new InvalidCustomerStateError("Customer requires an organization.");
    }
    const now = props.now ?? new Date();
    const id = asCustomerId(props.id ?? generateId());
    const number = props.customerNumber
      ? CustomerNumber.create(props.customerNumber)
      : CustomerNumber.generate(now);
    const customer = new Customer(
      id,
      props.organizationId,
      number,
      CustomerName.create(props.name),
      LegalName.create(props.legalName),
      CustomerStatus.LEAD,
      Industry.create(props.industry),
      BillingAddress.create(props.billingAddress),
      now,
      now,
      null,
    );
    customer.record(
      CustomerCreated.create({
        organizationId: props.organizationId,
        customerId: id,
        customerNumber: number.value,
        name: customer.name.value,
        status: CustomerStatus.LEAD,
        occurredAt: now,
      }),
    );
    return customer;
  }

  static reconstitute(snapshot: CustomerSnapshot): Customer {
    return new Customer(
      snapshot.id,
      snapshot.organizationId,
      CustomerNumber.create(snapshot.customerNumber),
      CustomerName.create(snapshot.name),
      LegalName.create(snapshot.legalName),
      snapshot.status,
      Industry.create(snapshot.industry),
      BillingAddress.create(snapshot.billingAddress),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get customerNumber(): CustomerNumber {
    return this._customerNumber;
  }
  get name(): CustomerName {
    return this._name;
  }
  get legalName(): LegalName {
    return this._legalName;
  }
  get status(): CustomerStatus {
    return this._status;
  }
  get industry(): Industry {
    return this._industry;
  }
  get billingAddress(): BillingAddress {
    return this._billingAddress;
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
  get isArchived(): boolean {
    return this._status === CustomerStatus.ARCHIVED;
  }
  get isActive(): boolean {
    return this._status === CustomerStatus.ACTIVE;
  }

  promoteToProspect(now: Date = new Date()): void {
    this.transitionTo(CustomerStatus.PROSPECT, now);
  }

  activate(now: Date = new Date()): void {
    this.transitionTo(CustomerStatus.ACTIVE, now);
    this.record(
      CustomerActivated.create({
        organizationId: this._organizationId,
        customerId: this.id,
        occurredAt: now,
      }),
    );
  }

  deactivate(now: Date = new Date()): void {
    this.transitionTo(CustomerStatus.INACTIVE, now);
  }

  /** Restore inactive customer back to ACTIVE. */
  restore(now: Date = new Date()): void {
    if (this._status !== CustomerStatus.INACTIVE) {
      throw new InvalidCustomerStateError(
        `Only INACTIVE customers can be restored (status: ${this._status}).`,
      );
    }
    this.transitionTo(CustomerStatus.ACTIVE, now);
    this.record(
      CustomerActivated.create({
        organizationId: this._organizationId,
        customerId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === CustomerStatus.ARCHIVED) {
      throw new InvalidCustomerStateError("Customer already archived.");
    }
    this.transitionTo(CustomerStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      CustomerArchived.create({
        organizationId: this._organizationId,
        customerId: this.id,
        occurredAt: now,
      }),
    );
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertMutable();
    this._name = CustomerName.create(name);
    this._updatedAt = now;
  }

  setLegalName(legalName: string | null, now: Date = new Date()): void {
    this.assertMutable();
    if (
      this._status === CustomerStatus.ACTIVE ||
      this._status === CustomerStatus.INACTIVE
    ) {
      if (!this._legalName.isEmpty) {
        throw new InvalidCustomerStateError(
          "Legal name is immutable once the customer is ACTIVE.",
        );
      }
    }
    this._legalName = LegalName.create(legalName);
    this._updatedAt = now;
  }

  setIndustry(industry: string | null, now: Date = new Date()): void {
    this.assertMutable();
    this._industry = Industry.create(industry);
    this._updatedAt = now;
  }

  setBillingAddress(address: string | null, now: Date = new Date()): void {
    this.assertMutable();
    this._billingAddress = BillingAddress.create(address);
    this._updatedAt = now;
  }

  toSnapshot(): CustomerSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      customerNumber: this._customerNumber.value,
      name: this._name.value,
      legalName: this._legalName.value,
      status: this._status,
      industry: this._industry.value,
      billingAddress: this._billingAddress.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: CustomerStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionCustomer(this._status, to)) {
      throw new InvalidCustomerStateError(
        `Cannot transition customer from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._status === CustomerStatus.ARCHIVED) {
      throw new InvalidCustomerStateError(
        "Archived customers are immutable.",
      );
    }
  }
}
