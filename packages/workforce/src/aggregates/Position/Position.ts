import type { OrganizationId } from "@creative-lab/organization";
import { PositionStatus } from "../../enums/PositionStatus.js";
import { PositionValidationError } from "../../errors/WorkforceErrors.js";
import {
  PositionArchived,
  PositionCreated,
  PositionUpdated,
} from "../../events/position-events.js";
import { AggregateRoot } from "@creative-lab/core";
import { asPositionId, type PositionId } from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { PositionTitle } from "../../value-objects/PositionTitle.js";

export type CreatePositionProps = {
  organizationId: OrganizationId;
  title: string;
  description?: string | null;
  grade?: string | null;
  id?: string;
  now?: Date;
};

export type PositionSnapshot = {
  id: PositionId;
  organizationId: OrganizationId;
  title: string;
  description: string | null;
  grade: string | null;
  status: PositionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class Position extends AggregateRoot<PositionId> {

  private constructor(
    id: PositionId,
    private readonly _organizationId: OrganizationId,
    private _title: PositionTitle,
    private _description: string | null,
    private _grade: string | null,
    private _status: PositionStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreatePositionProps): Position {
    const title = PositionTitle.create(props.title);
    const now = props.now ?? new Date();
    const id = asPositionId(props.id ?? generateId());
    const position = new Position(
      id,
      props.organizationId,
      title,
      props.description?.trim() || null,
      props.grade?.trim() || null,
      PositionStatus.ACTIVE,
      now,
      now,
    );
    position.record(
      PositionCreated.create({
        organizationId: props.organizationId,
        positionId: id,
        title: title.value,
        status: PositionStatus.ACTIVE,
        occurredAt: now,
      }),
    );
    return position;
  }

  static reconstitute(snapshot: PositionSnapshot): Position {
    return new Position(
      snapshot.id,
      snapshot.organizationId,
      PositionTitle.create(snapshot.title),
      snapshot.description,
      snapshot.grade,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }
  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get title(): PositionTitle {
    return this._title;
  }
  get description(): string | null {
    return this._description;
  }
  get grade(): string | null {
    return this._grade;
  }
  get status(): PositionStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get isArchived(): boolean {
    return this._status === PositionStatus.ARCHIVED;
  }

  update(props: {
    title?: string;
    description?: string | null;
    grade?: string | null;
    status?: PositionStatus;
    now?: Date;
  }): void {
    if (this.isArchived) {
      throw new PositionValidationError("Archived position cannot be modified.");
    }
    const now = props.now ?? new Date();
    if (props.title !== undefined) {
      this._title = PositionTitle.create(props.title);
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim() || null;
    }
    if (props.grade !== undefined) {
      this._grade = props.grade?.trim() || null;
    }
    if (props.status !== undefined) {
      if (props.status === PositionStatus.ARCHIVED) {
        this.archive(now);
        return;
      }
      this._status = props.status;
    }
    this._updatedAt = now;
    this.record(
      PositionUpdated.create({
        organizationId: this._organizationId,
        positionId: this.id,
        title: this._title.value,
        description: this._description,
        grade: this._grade,
        status: this._status,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this.isArchived) {
      throw new PositionValidationError("Position is already archived.");
    }
    this._status = PositionStatus.ARCHIVED;
    this._updatedAt = now;
    this.record(
      PositionArchived.create({
        organizationId: this._organizationId,
        positionId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): PositionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      title: this._title.value,
      description: this._description,
      grade: this._grade,
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
