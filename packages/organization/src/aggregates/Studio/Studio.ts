import { StudioStatus } from "../../enums/StudioStatus.js";
import { StudioType } from "../../enums/StudioType.js";
import {
  InvalidStudioCapacityError,
  StudioValidationError,
} from "../../errors/StudioErrors.js";
import {
  StudioCreated,
  StudioUpdated,
  StudioArchived,
} from "../../events/studio-events.js";
import { AggregateRoot } from "@creative-lab/core";
import {
  asStudioId,
  type OrganizationId,
  type StudioId,
} from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { StudioName } from "../../value-objects/StudioName.js";

export type CreateStudioProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  type: StudioType;
  capacity: number;
  location?: string | null;
  id?: string;
  now?: Date;
};

export type StudioSnapshot = {
  id: StudioId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  type: StudioType;
  capacity: number;
  location: string | null;
  status: StudioStatus;
  createdAt: Date;
  updatedAt: Date;
};

function assertCapacity(capacity: number): void {
  if (!Number.isFinite(capacity) || capacity < 0) {
    throw new InvalidStudioCapacityError(capacity);
  }
  if (!Number.isInteger(capacity)) {
    throw new StudioValidationError("Studio capacity must be an integer.");
  }
}

export class Studio extends AggregateRoot<StudioId> {

  private constructor(
    id: StudioId,
    private readonly _organizationId: OrganizationId,
    private _name: StudioName,
    private _description: string | null,
    private _type: StudioType,
    private _capacity: number,
    private _location: string | null,
    private _status: StudioStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateStudioProps): Studio {
    const name = StudioName.create(props.name);
    assertCapacity(props.capacity);
    if (!Object.values(StudioType).includes(props.type)) {
      throw new StudioValidationError(`Invalid studio type: ${String(props.type)}`);
    }
    const now = props.now ?? new Date();
    const id = asStudioId(props.id ?? generateId());

    const studio = new Studio(
      id,
      props.organizationId,
      name,
      props.description?.trim() || null,
      props.type,
      props.capacity,
      props.location?.trim() || null,
      StudioStatus.AVAILABLE,
      now,
      now,
    );

    studio.record(
      StudioCreated.create({
        organizationId: props.organizationId,
        studioId: id,
        name: name.value,
        type: props.type,
        capacity: props.capacity,
        status: StudioStatus.AVAILABLE,
        occurredAt: now,
      }),
    );

    return studio;
  }

  static reconstitute(snapshot: StudioSnapshot): Studio {
    return new Studio(
      snapshot.id,
      snapshot.organizationId,
      StudioName.create(snapshot.name),
      snapshot.description,
      snapshot.type,
      snapshot.capacity,
      snapshot.location,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }
  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): StudioName {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get type(): StudioType {
    return this._type;
  }
  get capacity(): number {
    return this._capacity;
  }
  get location(): string | null {
    return this._location;
  }
  get status(): StudioStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get isArchived(): boolean {
    return this._status === StudioStatus.ARCHIVED;
  }

  update(props: {
    name?: string;
    description?: string | null;
    type?: StudioType;
    capacity?: number;
    location?: string | null;
    status?: StudioStatus;
    now?: Date;
  }): void {
    if (this.isArchived && props.status !== StudioStatus.ARCHIVED) {
      // Allow no-op fields only if not trying to un-archive via freeform update
    }
    if (this.isArchived) {
      throw new StudioValidationError("Archived studio cannot be modified.");
    }
    const now = props.now ?? new Date();
    if (props.name !== undefined) {
      this._name = StudioName.create(props.name);
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim() || null;
    }
    if (props.type !== undefined) {
      if (!Object.values(StudioType).includes(props.type)) {
        throw new StudioValidationError(
          `Invalid studio type: ${String(props.type)}`,
        );
      }
      this._type = props.type;
    }
    if (props.capacity !== undefined) {
      assertCapacity(props.capacity);
      this._capacity = props.capacity;
    }
    if (props.location !== undefined) {
      this._location = props.location?.trim() || null;
    }
    if (props.status !== undefined) {
      if (props.status === StudioStatus.ARCHIVED) {
        this.archive(now);
        return;
      }
      this._status = props.status;
    }
    this._updatedAt = now;
    this.record(
      StudioUpdated.create({
        organizationId: this._organizationId,
        studioId: this.id,
        name: this._name.value,
        description: this._description,
        type: this._type,
        capacity: this._capacity,
        location: this._location,
        status: this._status,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this.isArchived) {
      throw new StudioValidationError("Studio is already archived.");
    }
    this._status = StudioStatus.ARCHIVED;
    this._updatedAt = now;
    this.record(
      StudioArchived.create({
        organizationId: this._organizationId,
        studioId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): StudioSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      description: this._description,
      type: this._type,
      capacity: this._capacity,
      location: this._location,
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
