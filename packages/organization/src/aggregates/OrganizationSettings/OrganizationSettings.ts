import { OrganizationSettingsUpdated } from "../../events/settings-events.js";
import { AggregateRoot } from "@creative-lab/core";
import type { BrandingMetadata, PoliciesMetadata } from "../../types/index.js";
import type { OrganizationId } from "../../types/ids.js";
import { Timezone } from "../../value-objects/Timezone.js";
import { Locale } from "../../value-objects/Locale.js";
import { Currency } from "../../value-objects/Currency.js";
import { WorkingWeek } from "../../value-objects/WorkingWeek.js";
import { WorkingHours } from "../../value-objects/WorkingHours.js";

export type CreateOrganizationSettingsProps = {
  organizationId: OrganizationId;
  timezone?: string;
  locale?: string;
  currency?: string;
  workingWeek?: WorkingWeek;
  workingHours?: WorkingHours;
  branding?: BrandingMetadata;
  policies?: PoliciesMetadata;
  now?: Date;
};

export type OrganizationSettingsSnapshot = {
  organizationId: OrganizationId;
  timezone: string;
  locale: string;
  currency: string;
  workingWeek: readonly string[];
  workingHours: Readonly<{ start: string; end: string }>;
  branding: BrandingMetadata;
  policies: PoliciesMetadata;
  updatedAt: Date;
};

/**
 * Organization-wide operational defaults.
 * One record per organization; lifecycle owned by Organization.
 */
export class OrganizationSettings extends AggregateRoot<OrganizationId> {

  private constructor(
    organizationId: OrganizationId,
    private _timezone: Timezone,
    private _locale: Locale,
    private _currency: Currency,
    private _workingWeek: WorkingWeek,
    private _workingHours: WorkingHours,
    private _branding: BrandingMetadata,
    private _policies: PoliciesMetadata,
    private _updatedAt: Date,
  ) {
    super(organizationId);
  }

  static create(props: CreateOrganizationSettingsProps): OrganizationSettings {
    const now = props.now ?? new Date();
    return new OrganizationSettings(
      props.organizationId,
      Timezone.create(props.timezone ?? "UTC"),
      Locale.create(props.locale ?? "en-US"),
      Currency.create(props.currency ?? "USD"),
      props.workingWeek ?? WorkingWeek.defaultMondayToFriday(),
      props.workingHours ?? WorkingHours.defaultNineToFive(),
      Object.freeze({ ...(props.branding ?? {}) }),
      Object.freeze({
        requireDepartmentForTeams: true,
        allowNestedDepartments: true,
        maxDepartmentDepth: 10,
        ...(props.policies ?? {}),
      }),
      now,
    );
  }

  /** Defaults aligned to a newly created organization. */
  static defaultsFor(
    organizationId: OrganizationId,
    defaults?: {
      timezone?: string;
      locale?: string;
      currency?: string;
      branding?: BrandingMetadata;
      now?: Date;
    },
  ): OrganizationSettings {
    return OrganizationSettings.create({
      organizationId,
      timezone: defaults?.timezone,
      locale: defaults?.locale,
      currency: defaults?.currency,
      branding: defaults?.branding,
      now: defaults?.now,
    });
  }

  static reconstitute(
    snapshot: OrganizationSettingsSnapshot,
  ): OrganizationSettings {
    return new OrganizationSettings(
      snapshot.organizationId,
      Timezone.create(snapshot.timezone),
      Locale.create(snapshot.locale),
      Currency.create(snapshot.currency),
      WorkingWeek.create(snapshot.workingWeek as never),
      WorkingHours.create(
        snapshot.workingHours.start,
        snapshot.workingHours.end,
      ),
      Object.freeze({ ...snapshot.branding }),
      Object.freeze({ ...snapshot.policies }),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this.id;
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
  get workingWeek(): WorkingWeek {
    return this._workingWeek;
  }
  get workingHours(): WorkingHours {
    return this._workingHours;
  }
  get branding(): BrandingMetadata {
    return this._branding;
  }
  get policies(): PoliciesMetadata {
    return this._policies;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  update(props: {
    timezone?: string;
    locale?: string;
    currency?: string;
    workingWeek?: WorkingWeek;
    workingHours?: WorkingHours;
    branding?: BrandingMetadata;
    policies?: PoliciesMetadata;
    now?: Date;
  }): void {
    const now = props.now ?? new Date();
    if (props.timezone !== undefined) {
      this._timezone = Timezone.create(props.timezone);
    }
    if (props.locale !== undefined) {
      this._locale = Locale.create(props.locale);
    }
    if (props.currency !== undefined) {
      this._currency = Currency.create(props.currency);
    }
    if (props.workingWeek !== undefined) {
      this._workingWeek = props.workingWeek;
    }
    if (props.workingHours !== undefined) {
      this._workingHours = props.workingHours;
    }
    if (props.branding !== undefined) {
      this._branding = Object.freeze({ ...props.branding });
    }
    if (props.policies !== undefined) {
      this._policies = Object.freeze({ ...props.policies });
    }
    this._updatedAt = now;
    this.record(
      OrganizationSettingsUpdated.create({
        organizationId: this.id,
        timezone: this._timezone.value,
        locale: this._locale.value,
        currency: this._currency.value,
        workingWeek: this._workingWeek.days,
        workingHours: {
          start: this._workingHours.start,
          end: this._workingHours.end,
        },
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): OrganizationSettingsSnapshot {
    return {
      organizationId: this.id,
      timezone: this._timezone.value,
      locale: this._locale.value,
      currency: this._currency.value,
      workingWeek: [...this._workingWeek.days],
      workingHours: {
        start: this._workingHours.start,
        end: this._workingHours.end,
      },
      branding: { ...this._branding },
      policies: { ...this._policies },
      updatedAt: new Date(this._updatedAt),
    };
  }
}
