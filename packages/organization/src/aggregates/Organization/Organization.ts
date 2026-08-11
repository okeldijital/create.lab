import {
  OrganizationStatus,
  canTransitionOrganizationStatus,
} from "../../enums/OrganizationStatus.js";
import {
  OrganizationArchivedError,
  InvalidOrganizationStatusTransitionError,
  OrganizationValidationError,
} from "../../errors/OrganizationErrors.js";
import {
  OrganizationCreated,
  OrganizationUpdated,
  OrganizationArchived,
} from "../../events/organization-events.js";
import { AggregateRoot } from "@creative-lab/core";
import type { BrandingMetadata } from "../../types/index.js";
import {
  asOrganizationId,
  type OrganizationId,
} from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { OrganizationName } from "../../value-objects/OrganizationName.js";
import { OrganizationSlug } from "../../value-objects/OrganizationSlug.js";
import { Timezone } from "../../value-objects/Timezone.js";
import { Locale } from "../../value-objects/Locale.js";
import { Currency } from "../../value-objects/Currency.js";

export type CreateOrganizationProps = {
  name: string;
  displayName?: string;
  legalName?: string;
  slug?: string;
  description?: string | null;
  timezone?: string;
  locale?: string;
  currency?: string;
  branding?: BrandingMetadata;
  id?: string;
  now?: Date;
};

export type OrganizationSnapshot = {
  id: OrganizationId;
  name: string;
  displayName: string;
  legalName: string;
  slug: string;
  description: string | null;
  timezone: string;
  locale: string;
  currency: string;
  status: OrganizationStatus;
  branding: BrandingMetadata;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Root aggregate of the Organization bounded context.
 * Owns organizational identity, status, and branding metadata.
 */
export class Organization extends AggregateRoot<OrganizationId> {

  private constructor(
    id: OrganizationId,
    private _name: OrganizationName,
    private _displayName: string,
    private _legalName: string,
    private _slug: OrganizationSlug,
    private _description: string | null,
    private _timezone: Timezone,
    private _locale: Locale,
    private _currency: Currency,
    private _status: OrganizationStatus,
    private _branding: BrandingMetadata,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateOrganizationProps): Organization {
    const name = OrganizationName.create(props.name);
    const displayName = (props.displayName ?? name.value).trim();
    if (!displayName) {
      throw new OrganizationValidationError("Display name cannot be empty.");
    }
    const legalName = (props.legalName ?? name.value).trim();
    if (!legalName) {
      throw new OrganizationValidationError("Legal name cannot be empty.");
    }
    const slug = props.slug
      ? OrganizationSlug.create(props.slug)
      : OrganizationSlug.fromName(name.value);
    const timezone = Timezone.create(props.timezone ?? "UTC");
    const locale = Locale.create(props.locale ?? "en-US");
    const currency = Currency.create(props.currency ?? "USD");
    const now = props.now ?? new Date();
    const id = asOrganizationId(props.id ?? generateId());

    const org = new Organization(
      id,
      name,
      displayName,
      legalName,
      slug,
      props.description?.trim() || null,
      timezone,
      locale,
      currency,
      OrganizationStatus.ACTIVE,
      Object.freeze({ ...(props.branding ?? {}) }),
      now,
      now,
      null,
    );

    org.record(
      OrganizationCreated.create({
        organizationId: id,
        name: name.value,
        displayName,
        slug: slug.value,
        status: OrganizationStatus.ACTIVE,
        occurredAt: now,
      }),
    );

    return org;
  }

  /** Rehydrate from persistence without raising domain events. */
  static reconstitute(snapshot: OrganizationSnapshot): Organization {
    return new Organization(
      snapshot.id,
      OrganizationName.create(snapshot.name),
      snapshot.displayName,
      snapshot.legalName,
      OrganizationSlug.create(snapshot.slug),
      snapshot.description,
      Timezone.create(snapshot.timezone),
      Locale.create(snapshot.locale),
      Currency.create(snapshot.currency),
      snapshot.status,
      Object.freeze({ ...snapshot.branding }),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }
  get name(): OrganizationName {
    return this._name;
  }
  get displayName(): string {
    return this._displayName;
  }
  get legalName(): string {
    return this._legalName;
  }
  get slug(): OrganizationSlug {
    return this._slug;
  }
  get description(): string | null {
    return this._description;
  }
  get timezone(): Timezone {
    return this._timezone;
  }
  get locale(): Locale {
    return this._locale;
  }
  get currency(): Currency {
    return this._currency;
  }
  get status(): OrganizationStatus {
    return this._status;
  }
  get branding(): BrandingMetadata {
    return this._branding;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get archivedAt(): Date | null {
    return this._archivedAt;
  }
  get isArchived(): boolean {
    return this._status === OrganizationStatus.ARCHIVED;
  }

  update(props: {
    name?: string;
    displayName?: string;
    legalName?: string;
    description?: string | null;
    timezone?: string;
    locale?: string;
    currency?: string;
    branding?: BrandingMetadata;
    now?: Date;
  }): void {
    this.assertNotArchived();
    const now = props.now ?? new Date();

    if (props.name !== undefined) {
      this._name = OrganizationName.create(props.name);
    }
    if (props.displayName !== undefined) {
      const displayName = props.displayName.trim();
      if (!displayName) {
        throw new OrganizationValidationError("Display name cannot be empty.");
      }
      this._displayName = displayName;
    }
    if (props.legalName !== undefined) {
      const legalName = props.legalName.trim();
      if (!legalName) {
        throw new OrganizationValidationError("Legal name cannot be empty.");
      }
      this._legalName = legalName;
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim() || null;
    }
    if (props.timezone !== undefined) {
      this._timezone = Timezone.create(props.timezone);
    }
    if (props.locale !== undefined) {
      this._locale = Locale.create(props.locale);
    }
    if (props.currency !== undefined) {
      this._currency = Currency.create(props.currency);
    }
    if (props.branding !== undefined) {
      this._branding = Object.freeze({ ...props.branding });
    }

    this._updatedAt = now;
    this.record(
      OrganizationUpdated.create({
        organizationId: this.id,
        name: this._name.value,
        displayName: this._displayName,
        legalName: this._legalName,
        description: this._description,
        timezone: this._timezone.value,
        locale: this._locale.value,
        currency: this._currency.value,
        status: this._status,
        occurredAt: now,
      }),
    );
  }

  changeStatus(to: OrganizationStatus, now: Date = new Date()): void {
    this.assertNotArchived();
    if (!canTransitionOrganizationStatus(this._status, to)) {
      throw new InvalidOrganizationStatusTransitionError(this._status, to);
    }
    if (this._status === to) {
      return;
    }
    if (to === OrganizationStatus.ARCHIVED) {
      this.archive(now);
      return;
    }
    this._status = to;
    this._updatedAt = now;
    this.record(
      OrganizationUpdated.create({
        organizationId: this.id,
        name: this._name.value,
        displayName: this._displayName,
        legalName: this._legalName,
        description: this._description,
        timezone: this._timezone.value,
        locale: this._locale.value,
        currency: this._currency.value,
        status: this._status,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this.isArchived) {
      throw new OrganizationArchivedError(this.id);
    }
    if (!canTransitionOrganizationStatus(this._status, OrganizationStatus.ARCHIVED)) {
      throw new InvalidOrganizationStatusTransitionError(
        this._status,
        OrganizationStatus.ARCHIVED,
      );
    }
    this._status = OrganizationStatus.ARCHIVED;
    this._archivedAt = now;
    this._updatedAt = now;
    this.record(
      OrganizationArchived.create({
        organizationId: this.id,
        archivedAt: now,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): OrganizationSnapshot {
    return {
      id: this.id,
      name: this._name.value,
      displayName: this._displayName,
      legalName: this._legalName,
      slug: this._slug.value,
      description: this._description,
      timezone: this._timezone.value,
      locale: this._locale.value,
      currency: this._currency.value,
      status: this._status,
      branding: { ...this._branding },
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
      archivedAt: this._archivedAt ? new Date(this._archivedAt) : null,
    };
  }

  private assertNotArchived(): void {
    if (this.isArchived) {
      throw new OrganizationArchivedError(this.id);
    }
  }
}
