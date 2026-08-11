import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { CategoryStatus } from "../../enums/CategoryStatus.js";
import { InvalidServiceStateError } from "../../errors/ServicesErrors.js";
import {
  CategoryArchived,
  CategoryCreated,
} from "../../events/services-events.js";
import {
  asServiceCategoryId,
  type ServiceCategoryId,
} from "../../types/ids.js";
import { CategoryName } from "../../value-objects/CategoryName.js";
import { ServiceDescription } from "../../value-objects/ServiceDescription.js";

export type CreateServiceCategoryProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  id?: string;
  now?: Date;
};

export type ServiceCategorySnapshot = {
  id: ServiceCategoryId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export class ServiceCategory extends AggregateRoot<ServiceCategoryId> {
  private constructor(
    id: ServiceCategoryId,
    private readonly _organizationId: OrganizationId,
    private _name: CategoryName,
    private _description: ServiceDescription,
    private _status: CategoryStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateServiceCategoryProps): ServiceCategory {
    if (!props.organizationId) {
      throw new InvalidServiceStateError("Category requires an organization.");
    }
    const now = props.now ?? new Date();
    const id = asServiceCategoryId(props.id ?? generateId());
    const category = new ServiceCategory(
      id,
      props.organizationId,
      CategoryName.create(props.name),
      ServiceDescription.create(props.description),
      CategoryStatus.ACTIVE,
      now,
      now,
      null,
    );
    category.record(
      CategoryCreated.create({
        organizationId: props.organizationId,
        categoryId: id,
        name: category.name.value,
        occurredAt: now,
      }),
    );
    return category;
  }

  static reconstitute(snapshot: ServiceCategorySnapshot): ServiceCategory {
    return new ServiceCategory(
      snapshot.id,
      snapshot.organizationId,
      CategoryName.create(snapshot.name),
      ServiceDescription.create(snapshot.description),
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): CategoryName {
    return this._name;
  }
  get description(): ServiceDescription {
    return this._description;
  }
  get status(): CategoryStatus {
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
    return this._status === CategoryStatus.ARCHIVED;
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertMutable();
    this._name = CategoryName.create(name);
    this._updatedAt = now;
  }

  setDescription(description: string | null, now: Date = new Date()): void {
    this.assertMutable();
    this._description = ServiceDescription.create(description);
    this._updatedAt = now;
  }

  archive(now: Date = new Date()): void {
    if (this._status === CategoryStatus.ARCHIVED) {
      throw new InvalidServiceStateError("Category already archived.");
    }
    this._status = CategoryStatus.ARCHIVED;
    this._archivedAt = now;
    this._updatedAt = now;
    this.record(
      CategoryArchived.create({
        organizationId: this._organizationId,
        categoryId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ServiceCategorySnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      description: this._description.value,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private assertMutable(): void {
    if (this._status === CategoryStatus.ARCHIVED) {
      throw new InvalidServiceStateError(
        "Archived categories are immutable.",
      );
    }
  }
}
