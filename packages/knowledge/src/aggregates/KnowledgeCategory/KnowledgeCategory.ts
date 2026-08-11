import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { CategoryStatus } from "../../enums/CategoryStatus.js";
import { InvalidKnowledgeStateError } from "../../errors/KnowledgeErrors.js";
import {
  KnowledgeCategoryArchived,
  KnowledgeCategoryCreated,
} from "../../events/knowledge-events.js";
import {
  asKnowledgeCategoryId,
  type KnowledgeCategoryId,
} from "../../types/ids.js";
import { CategoryName } from "../../value-objects/CategoryName.js";
import { KnowledgeDescription } from "../../value-objects/KnowledgeDescription.js";

export type CreateKnowledgeCategoryProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  id?: string;
  now?: Date;
};

export type KnowledgeCategorySnapshot = {
  id: KnowledgeCategoryId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export class KnowledgeCategory extends AggregateRoot<KnowledgeCategoryId> {
  private constructor(
    id: KnowledgeCategoryId,
    private readonly _organizationId: OrganizationId,
    private _name: CategoryName,
    private _description: KnowledgeDescription,
    private _status: CategoryStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateKnowledgeCategoryProps): KnowledgeCategory {
    if (!props.organizationId) {
      throw new InvalidKnowledgeStateError(
        "Category requires an organization.",
      );
    }
    const now = props.now ?? new Date();
    const id = asKnowledgeCategoryId(props.id ?? generateId());
    const category = new KnowledgeCategory(
      id,
      props.organizationId,
      CategoryName.create(props.name),
      KnowledgeDescription.create(props.description),
      CategoryStatus.ACTIVE,
      now,
      now,
      null,
    );
    category.record(
      KnowledgeCategoryCreated.create({
        organizationId: props.organizationId,
        categoryId: id,
        name: category.name.value,
        occurredAt: now,
      }),
    );
    return category;
  }

  static reconstitute(
    snapshot: KnowledgeCategorySnapshot,
  ): KnowledgeCategory {
    return new KnowledgeCategory(
      snapshot.id,
      snapshot.organizationId,
      CategoryName.create(snapshot.name),
      KnowledgeDescription.create(snapshot.description),
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
  get description(): KnowledgeDescription {
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
  get isActive(): boolean {
    return this._status === CategoryStatus.ACTIVE;
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertMutable();
    this._name = CategoryName.create(name);
    this._updatedAt = now;
  }

  archive(now: Date = new Date()): void {
    if (this._status === CategoryStatus.ARCHIVED) {
      throw new InvalidKnowledgeStateError("Category already archived.");
    }
    this._status = CategoryStatus.ARCHIVED;
    this._archivedAt = now;
    this._updatedAt = now;
    this.record(
      KnowledgeCategoryArchived.create({
        organizationId: this._organizationId,
        categoryId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): KnowledgeCategorySnapshot {
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
      throw new InvalidKnowledgeStateError(
        "Archived categories are immutable.",
      );
    }
  }
}
