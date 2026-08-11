import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ContactStatus } from "../../enums/ContactStatus.js";
import { InvalidCustomerStateError } from "../../errors/CRMErrors.js";
import { ContactAdded } from "../../events/crm-events.js";
import {
  asContactId,
  type ContactId,
  type CustomerId,
} from "../../types/ids.js";
import { ContactName } from "../../value-objects/ContactName.js";
import { ContactRole } from "../../value-objects/ContactRole.js";
import { EmailAddress } from "../../value-objects/EmailAddress.js";
import { PhoneNumber } from "../../value-objects/PhoneNumber.js";

export type CreateContactProps = {
  organizationId: OrganizationId;
  customerId: CustomerId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  isPrimary?: boolean;
  id?: string;
  now?: Date;
};

export type ContactSnapshot = {
  id: ContactId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Individual belonging to a customer. One primary per customer (enforced by service).
 */
export class Contact extends AggregateRoot<ContactId> {
  private constructor(
    id: ContactId,
    private readonly _organizationId: OrganizationId,
    private readonly _customerId: CustomerId,
    private readonly _firstName: ContactName,
    private readonly _lastName: ContactName,
    private readonly _email: EmailAddress,
    private _phone: PhoneNumber,
    private _role: ContactRole,
    private _isPrimary: boolean,
    private _status: ContactStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateContactProps): Contact {
    if (!props.customerId) {
      throw new InvalidCustomerStateError("Contact requires a customer.");
    }
    const now = props.now ?? new Date();
    const id = asContactId(props.id ?? generateId());
    const isPrimary = props.isPrimary === true;
    const contact = new Contact(
      id,
      props.organizationId,
      props.customerId,
      ContactName.create(props.firstName, "First name"),
      ContactName.create(props.lastName, "Last name"),
      EmailAddress.create(props.email),
      PhoneNumber.create(props.phone),
      ContactRole.create(props.role),
      isPrimary,
      ContactStatus.ACTIVE,
      now,
      now,
      null,
    );
    contact.record(
      ContactAdded.create({
        organizationId: props.organizationId,
        contactId: id,
        customerId: props.customerId,
        email: contact.email.value,
        isPrimary,
        occurredAt: now,
      }),
    );
    return contact;
  }

  static reconstitute(snapshot: ContactSnapshot): Contact {
    return new Contact(
      snapshot.id,
      snapshot.organizationId,
      snapshot.customerId,
      ContactName.create(snapshot.firstName, "First name"),
      ContactName.create(snapshot.lastName, "Last name"),
      EmailAddress.create(snapshot.email),
      PhoneNumber.create(snapshot.phone),
      ContactRole.create(snapshot.role),
      snapshot.isPrimary,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get customerId(): CustomerId {
    return this._customerId;
  }
  get firstName(): ContactName {
    return this._firstName;
  }
  get lastName(): ContactName {
    return this._lastName;
  }
  get email(): EmailAddress {
    return this._email;
  }
  get phone(): PhoneNumber {
    return this._phone;
  }
  get role(): ContactRole {
    return this._role;
  }
  get isPrimary(): boolean {
    return this._isPrimary;
  }
  get status(): ContactStatus {
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
  get isArchived(): boolean {
    return this._status === ContactStatus.ARCHIVED;
  }

  markPrimary(now: Date = new Date()): void {
    this.assertMutable();
    this._isPrimary = true;
    this._updatedAt = now;
  }

  clearPrimary(now: Date = new Date()): void {
    this.assertMutable();
    this._isPrimary = false;
    this._updatedAt = now;
  }

  deactivate(now: Date = new Date()): void {
    this.assertMutable();
    this._status = ContactStatus.INACTIVE;
    this._isPrimary = false;
    this._updatedAt = now;
  }

  archive(now: Date = new Date()): void {
    if (this._status === ContactStatus.ARCHIVED) {
      throw new InvalidCustomerStateError("Contact already archived.");
    }
    this._status = ContactStatus.ARCHIVED;
    this._isPrimary = false;
    this._archivedAt = now;
    this._updatedAt = now;
  }

  toSnapshot(): ContactSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      customerId: this._customerId,
      firstName: this._firstName.value,
      lastName: this._lastName.value,
      email: this._email.value,
      phone: this._phone.value,
      role: this._role.value,
      isPrimary: this._isPrimary,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private assertMutable(): void {
    if (this._status === ContactStatus.ARCHIVED) {
      throw new InvalidCustomerStateError(
        "Archived contacts are immutable.",
      );
    }
  }
}
