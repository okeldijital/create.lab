import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { PricingModel } from "../../enums/PricingModel.js";
import {
  ServiceStatus,
  canTransitionService,
} from "../../enums/ServiceStatus.js";
import { InvalidServiceStateError } from "../../errors/ServicesErrors.js";
import {
  ServiceActivated,
  ServiceArchived,
  ServiceCreated,
} from "../../events/services-events.js";
import {
  asServiceId,
  type PriceBookId,
  type ServiceCategoryId,
  type ServiceId,
} from "../../types/ids.js";
import { ServiceCode } from "../../value-objects/ServiceCode.js";
import { ServiceDescription } from "../../value-objects/ServiceDescription.js";
import { ServiceName } from "../../value-objects/ServiceName.js";

export type CreateServiceProps = {
  organizationId: OrganizationId;
  serviceCode: string;
  name: string;
  description?: string | null;
  categoryId: ServiceCategoryId;
  defaultPriceBookId?: PriceBookId | null;
  pricingModel?: PricingModel;
  id?: string;
  now?: Date;
};

export type ServiceSnapshot = {
  id: ServiceId;
  organizationId: OrganizationId;
  serviceCode: string;
  name: string;
  description: string | null;
  categoryId: ServiceCategoryId;
  defaultPriceBookId: string | null;
  pricingModel: PricingModel;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Commercial offering. serviceCode immutable; category immutable once ACTIVE.
 */
export class Service extends AggregateRoot<ServiceId> {
  private constructor(
    id: ServiceId,
    private readonly _organizationId: OrganizationId,
    private readonly _serviceCode: ServiceCode,
    private _name: ServiceName,
    private _description: ServiceDescription,
    private _categoryId: ServiceCategoryId,
    private _defaultPriceBookId: PriceBookId | null,
    private readonly _pricingModel: PricingModel,
    private _status: ServiceStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateServiceProps): Service {
    if (!props.organizationId) {
      throw new InvalidServiceStateError("Service requires an organization.");
    }
    if (!props.categoryId) {
      throw new InvalidServiceStateError("Service requires a category.");
    }
    const model = props.pricingModel ?? PricingModel.FIXED;
    if (!Object.values(PricingModel).includes(model)) {
      throw new InvalidServiceStateError(
        `Invalid pricing model: ${String(model)}`,
      );
    }
    const now = props.now ?? new Date();
    const id = asServiceId(props.id ?? generateId());
    const service = new Service(
      id,
      props.organizationId,
      ServiceCode.create(props.serviceCode),
      ServiceName.create(props.name),
      ServiceDescription.create(props.description),
      props.categoryId,
      props.defaultPriceBookId ?? null,
      model,
      ServiceStatus.DRAFT,
      now,
      now,
      null,
    );
    service.record(
      ServiceCreated.create({
        organizationId: props.organizationId,
        serviceId: id,
        serviceCode: service.serviceCode.value,
        name: service.name.value,
        status: ServiceStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return service;
  }

  static reconstitute(snapshot: ServiceSnapshot): Service {
    return new Service(
      snapshot.id,
      snapshot.organizationId,
      ServiceCode.create(snapshot.serviceCode),
      ServiceName.create(snapshot.name),
      ServiceDescription.create(snapshot.description),
      snapshot.categoryId,
      (snapshot.defaultPriceBookId as PriceBookId | null) ?? null,
      snapshot.pricingModel,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get serviceCode(): ServiceCode {
    return this._serviceCode;
  }
  get name(): ServiceName {
    return this._name;
  }
  get description(): ServiceDescription {
    return this._description;
  }
  get categoryId(): ServiceCategoryId {
    return this._categoryId;
  }
  get defaultPriceBookId(): PriceBookId | null {
    return this._defaultPriceBookId;
  }
  get pricingModel(): PricingModel {
    return this._pricingModel;
  }
  get status(): ServiceStatus {
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
    return this._status === ServiceStatus.DRAFT;
  }
  get isActive(): boolean {
    return this._status === ServiceStatus.ACTIVE;
  }
  get isArchived(): boolean {
    return this._status === ServiceStatus.ARCHIVED;
  }

  activate(now: Date = new Date()): void {
    this.transitionTo(ServiceStatus.ACTIVE, now);
    this.record(
      ServiceActivated.create({
        organizationId: this._organizationId,
        serviceId: this.id,
        occurredAt: now,
      }),
    );
  }

  deactivate(now: Date = new Date()): void {
    this.transitionTo(ServiceStatus.INACTIVE, now);
  }

  archive(now: Date = new Date()): void {
    if (this._status === ServiceStatus.ARCHIVED) {
      throw new InvalidServiceStateError("Service already archived.");
    }
    this.transitionTo(ServiceStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      ServiceArchived.create({
        organizationId: this._organizationId,
        serviceId: this.id,
        occurredAt: now,
      }),
    );
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertMutable();
    this._name = ServiceName.create(name);
    this._updatedAt = now;
  }

  setDescription(description: string | null, now: Date = new Date()): void {
    this.assertMutable();
    this._description = ServiceDescription.create(description);
    this._updatedAt = now;
  }

  setCategory(categoryId: ServiceCategoryId, now: Date = new Date()): void {
    this.assertMutable();
    if (
      this._status === ServiceStatus.ACTIVE ||
      this._status === ServiceStatus.INACTIVE
    ) {
      throw new InvalidServiceStateError(
        "Category is immutable once the service is ACTIVE.",
      );
    }
    if (!categoryId) {
      throw new InvalidServiceStateError("Category is required.");
    }
    this._categoryId = categoryId;
    this._updatedAt = now;
  }

  setDefaultPriceBook(
    priceBookId: PriceBookId | null,
    now: Date = new Date(),
  ): void {
    this.assertMutable();
    this._defaultPriceBookId = priceBookId;
    this._updatedAt = now;
  }

  toSnapshot(): ServiceSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      serviceCode: this._serviceCode.value,
      name: this._name.value,
      description: this._description.value,
      categoryId: this._categoryId,
      defaultPriceBookId: this._defaultPriceBookId,
      pricingModel: this._pricingModel,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: ServiceStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionService(this._status, to)) {
      throw new InvalidServiceStateError(
        `Cannot transition service from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._status === ServiceStatus.ARCHIVED) {
      throw new InvalidServiceStateError("Archived services are immutable.");
    }
  }
}
