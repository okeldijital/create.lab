import { TeamStatus } from "../../enums/TeamStatus.js";
import {
  TeamCreated,
  TeamUpdated,
  TeamArchived,
} from "../../events/team-events.js";
import { AggregateRoot } from "@creative-lab/core";
import {
  asTeamId,
  type DepartmentId,
  type OrganizationId,
  type TeamId,
} from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { TeamName } from "../../value-objects/TeamName.js";

export type CreateTeamProps = {
  organizationId: OrganizationId;
  departmentId: DepartmentId;
  name: string;
  description?: string | null;
  id?: string;
  now?: Date;
};

export type TeamSnapshot = {
  id: TeamId;
  organizationId: OrganizationId;
  departmentId: DepartmentId;
  name: string;
  description: string | null;
  status: TeamStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class Team extends AggregateRoot<TeamId> {

  private constructor(
    id: TeamId,
    private readonly _organizationId: OrganizationId,
    private _departmentId: DepartmentId,
    private _name: TeamName,
    private _description: string | null,
    private _status: TeamStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateTeamProps): Team {
    const name = TeamName.create(props.name);
    const now = props.now ?? new Date();
    const id = asTeamId(props.id ?? generateId());

    const team = new Team(
      id,
      props.organizationId,
      props.departmentId,
      name,
      props.description?.trim() || null,
      TeamStatus.ACTIVE,
      now,
      now,
    );

    team.record(
      TeamCreated.create({
        organizationId: props.organizationId,
        teamId: id,
        departmentId: props.departmentId,
        name: name.value,
        status: TeamStatus.ACTIVE,
        occurredAt: now,
      }),
    );

    return team;
  }

  static reconstitute(snapshot: TeamSnapshot): Team {
    return new Team(
      snapshot.id,
      snapshot.organizationId,
      snapshot.departmentId,
      TeamName.create(snapshot.name),
      snapshot.description,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }
  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get departmentId(): DepartmentId {
    return this._departmentId;
  }
  get name(): TeamName {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get status(): TeamStatus {
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
    departmentId?: DepartmentId;
    status?: TeamStatus;
    now?: Date;
  }): void {
    const now = props.now ?? new Date();
    if (props.name !== undefined) {
      this._name = TeamName.create(props.name);
    }
    if (props.description !== undefined) {
      this._description = props.description?.trim() || null;
    }
    if (props.departmentId !== undefined) {
      this._departmentId = props.departmentId;
    }
    if (props.status !== undefined) {
      this._status = props.status;
    }
    this._updatedAt = now;
    this.record(
      TeamUpdated.create({
        organizationId: this._organizationId,
        teamId: this.id,
        departmentId: this._departmentId,
        name: this._name.value,
        description: this._description,
        status: this._status,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    this._status = TeamStatus.INACTIVE;
    this._updatedAt = now;
    this.record(
      TeamArchived.create({
        organizationId: this._organizationId,
        teamId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): TeamSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      departmentId: this._departmentId,
      name: this._name.value,
      description: this._description,
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
