import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { DependencyStatus } from "../../enums/DependencyStatus.js";
import { DependencyType } from "../../enums/DependencyType.js";
import {
  InvalidProjectStateError,
  SelfDependencyError,
} from "../../errors/ProjectErrors.js";
import { DependencyCreated } from "../../events/project-events.js";
import {
  asProjectDependencyId,
  type ProjectDependencyId,
  type ProjectId,
} from "../../types/ids.js";

export type CreateProjectDependencyProps = {
  organizationId: OrganizationId;
  projectId: ProjectId;
  dependsOnProjectId: ProjectId;
  dependencyType?: DependencyType;
  id?: string;
  now?: Date;
};

export type ProjectDependencySnapshot = {
  id: ProjectDependencyId;
  organizationId: OrganizationId;
  projectId: ProjectId;
  dependsOnProjectId: ProjectId;
  dependencyType: DependencyType;
  status: DependencyStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Relationship between projects. Cycle prevention enforced by DependencyPolicy.
 * Historical dependencies are retained (cancel/resolve rather than delete).
 */
export class ProjectDependency extends AggregateRoot<ProjectDependencyId> {
  private constructor(
    id: ProjectDependencyId,
    private readonly _organizationId: OrganizationId,
    private readonly _projectId: ProjectId,
    private readonly _dependsOnProjectId: ProjectId,
    private readonly _dependencyType: DependencyType,
    private _status: DependencyStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateProjectDependencyProps): ProjectDependency {
    if (!props.projectId || !props.dependsOnProjectId) {
      throw new InvalidProjectStateError(
        "Dependency requires projectId and dependsOnProjectId.",
      );
    }
    if (props.projectId === props.dependsOnProjectId) {
      throw new SelfDependencyError(props.projectId);
    }
    const dependencyType = props.dependencyType ?? DependencyType.BLOCKS;
    if (!Object.values(DependencyType).includes(dependencyType)) {
      throw new InvalidProjectStateError(
        `Invalid dependency type: ${String(dependencyType)}`,
      );
    }
    const now = props.now ?? new Date();
    const id = asProjectDependencyId(props.id ?? generateId());
    const dep = new ProjectDependency(
      id,
      props.organizationId,
      props.projectId,
      props.dependsOnProjectId,
      dependencyType,
      DependencyStatus.ACTIVE,
      now,
      now,
    );
    dep.record(
      DependencyCreated.create({
        organizationId: props.organizationId,
        dependencyId: id,
        projectId: props.projectId,
        dependsOnProjectId: props.dependsOnProjectId,
        dependencyType,
        occurredAt: now,
      }),
    );
    return dep;
  }

  static reconstitute(
    snapshot: ProjectDependencySnapshot,
  ): ProjectDependency {
    return new ProjectDependency(
      snapshot.id,
      snapshot.organizationId,
      snapshot.projectId,
      snapshot.dependsOnProjectId,
      snapshot.dependencyType,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get projectId(): ProjectId {
    return this._projectId;
  }
  get dependsOnProjectId(): ProjectId {
    return this._dependsOnProjectId;
  }
  get dependencyType(): DependencyType {
    return this._dependencyType;
  }
  get status(): DependencyStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isActive(): boolean {
    return this._status === DependencyStatus.ACTIVE;
  }

  resolve(now: Date = new Date()): void {
    if (this._status !== DependencyStatus.ACTIVE) {
      throw new InvalidProjectStateError(
        `Only ACTIVE dependencies can be resolved (status: ${this._status}).`,
      );
    }
    this._status = DependencyStatus.RESOLVED;
    this._updatedAt = now;
  }

  cancel(now: Date = new Date()): void {
    if (this._status === DependencyStatus.CANCELLED) return;
    this._status = DependencyStatus.CANCELLED;
    this._updatedAt = now;
  }

  toSnapshot(): ProjectDependencySnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      projectId: this._projectId,
      dependsOnProjectId: this._dependsOnProjectId,
      dependencyType: this._dependencyType,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
