import { DepartmentStatus } from "../../enums/DepartmentStatus.js";
import { DepartmentValidationError } from "../../errors/DepartmentErrors.js";
import {
  DepartmentCreated,
  DepartmentUpdated,
  DepartmentArchived,
} from "../../events/department-events.js";
import { AggregateRoot } from "@creative-lab/core";
import {
  asDepartmentId,
  type DepartmentId,
  type OrganizationId,
} from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { DepartmentName } from "../../value-objects/DepartmentName.js";

export type CreateDepartmentProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  parentDepartmentId?: DepartmentId | null;
  /** Future workforce reference — opaque identifier only. */
  headId?: string | null;
  id?: string;
  now?: Date;
};

export type DepartmentSnapshot = {
  id: DepartmentId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  parentDepartmentId: DepartmentId | null;
  headId: string | null;
  status: DepartmentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class Department extends AggregateRoot<DepartmentId> {

  private constructor(
    id: DepartmentId,
    private readonly _organizationId: OrganizationId,
    private _name: DepartmentName,
    private _description: string | null,
    private _parentDepartmentId: DepartmentId | null,
    private _headId: string | null,
    private _status: DepartmentStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateDepartmentProps): Department {
    const name = DepartmentName.create(props.name);
    if (props.parentDepartmentId && props.parentDepartmentId === props.id) {
      throw new DepartmentValidationError(
        "Department cannot be its own parent.",
      );
    }
    const now = props.now ?? new Date();
    const id = asDepartmentId(props.id ?? generateId());

    const dept = new Department(
      id,
      props.organizationId,
      name,
      props.description?.trim() || null,
      props.parentDepartmentId ?? null,
      props.headId ?? null,
      DepartmentStatus.ACTIVE,
      now,
      now,
    );

    dept.record(
      DepartmentCreated.create({
        organizationId: props.organizationId,
        departmentId: id,
        name: name.value,
        parentDepartmentId: props.parentDepartmentId ?? null,
        status: DepartmentStatus.ACTIVE,
        occurredAt: now,
      }),
    );

    return dept;
  }

  static reconstitute(snapshot: DepartmentSnapshot): Department {
    return new Department(
      snapshot.id,
      snapshot.organizationId,
      DepartmentName.create(snapshot.name),
      snapshot.description,
      snapshot.parentDepartmentId,
      snapshot.headId,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }
  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): DepartmentName {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get parentDepartmentId(): DepartmentId | null {
    return this._parentDepartmentId;
  }
  get headId(): string | null {
    return this._headId;
  }
  get status(): DepartmentStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  update(props: {
    name?: string;
    description?: string | null;
    parentDepartmentId?: DepartmentId | null;
    headId?: string | null;
    status?: DepartmentStatus;
    now?: Date;
  }): void {
    const now = props.now ?? new Date();
    if (props.name !== undefined) {
      this._name = DepartmentName.create(props.name);
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim() || null;
    }
    if (props.parentDepartmentId !== undefined) {
      if (props.parentDepartmentId === this.id) {
        throw new DepartmentValidationError(
          "Department cannot be its own parent.",
        );
      }
      this._parentDepartmentId = props.parentDepartmentId;
    }
    if (props.headId !== undefined) {
      this._headId = props.headId;
    }
    if (props.status !== undefined) {
      this._status = props.status;
    }
    this._updatedAt = now;
    this.record(
      DepartmentUpdated.create({
        organizationId: this._organizationId,
        departmentId: this.id,
        name: this._name.value,
        description: this._description,
        parentDepartmentId: this._parentDepartmentId,
        status: this._status,
        occurredAt: now,
      }),
    );
  }

  /** Soft-deactivate / archive department (status → INACTIVE). */
  archive(now: Date = new Date()): void {
    this._status = DepartmentStatus.INACTIVE;
    this._updatedAt = now;
    this.record(
      DepartmentArchived.create({
        organizationId: this._organizationId,
        departmentId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): DepartmentSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      description: this._description,
      parentDepartmentId: this._parentDepartmentId,
      headId: this._headId,
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
