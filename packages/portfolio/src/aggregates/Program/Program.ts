import { AggregateRoot, generateId } from "@creative-lab/core";
import type { EngagementId } from "@creative-lab/engagement";
import type { OrganizationId } from "@creative-lab/organization";
import type { ProjectId } from "@creative-lab/projects";
import {
  ProgramStatus,
  canTransitionProgram,
} from "../../enums/ProgramStatus.js";
import { InvalidPortfolioStateError } from "../../errors/PortfolioErrors.js";
import {
  ProgramCompleted,
  ProgramCreated,
} from "../../events/portfolio-events.js";
import {
  asProgramId,
  type PortfolioId,
  type ProgramId,
} from "../../types/ids.js";
import { PortfolioDescription } from "../../value-objects/PortfolioDescription.js";
import { ProgramName } from "../../value-objects/ProgramName.js";
import { SequenceNumber } from "../../value-objects/SequenceNumber.js";

export type CreateProgramProps = {
  organizationId: OrganizationId;
  portfolioId: PortfolioId;
  name: string;
  description?: string | null;
  sequence: number;
  id?: string;
  now?: Date;
};

export type ProgramSnapshot = {
  id: ProgramId;
  organizationId: OrganizationId;
  portfolioId: PortfolioId;
  name: string;
  description: string | null;
  status: ProgramStatus;
  engagementIds: string[];
  projectIds: string[];
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Program extends AggregateRoot<ProgramId> {
  private constructor(
    id: ProgramId,
    private readonly _organizationId: OrganizationId,
    private readonly _portfolioId: PortfolioId,
    private readonly _name: ProgramName,
    private _description: PortfolioDescription,
    private _status: ProgramStatus,
    private _engagementIds: EngagementId[],
    private _projectIds: ProjectId[],
    private readonly _sequence: SequenceNumber,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateProgramProps): Program {
    if (!props.portfolioId) {
      throw new InvalidPortfolioStateError("Program requires a portfolio.");
    }
    const now = props.now ?? new Date();
    const id = asProgramId(props.id ?? generateId());
    const p = new Program(
      id,
      props.organizationId,
      props.portfolioId,
      ProgramName.create(props.name),
      PortfolioDescription.create(props.description),
      ProgramStatus.PLANNED,
      [],
      [],
      SequenceNumber.create(props.sequence),
      now,
      now,
    );
    p.record(
      ProgramCreated.create({
        organizationId: props.organizationId,
        programId: id,
        portfolioId: props.portfolioId,
        name: p.name.value,
        sequence: p.sequence,
        status: ProgramStatus.PLANNED,
        occurredAt: now,
      }),
    );
    return p;
  }

  static reconstitute(snapshot: ProgramSnapshot): Program {
    return new Program(
      snapshot.id,
      snapshot.organizationId,
      snapshot.portfolioId,
      ProgramName.create(snapshot.name),
      PortfolioDescription.create(snapshot.description),
      snapshot.status,
      snapshot.engagementIds as EngagementId[],
      snapshot.projectIds as ProjectId[],
      SequenceNumber.create(snapshot.sequence),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get portfolioId(): PortfolioId {
    return this._portfolioId;
  }
  get name(): ProgramName {
    return this._name;
  }
  get description(): PortfolioDescription {
    return this._description;
  }
  get status(): ProgramStatus {
    return this._status;
  }
  get engagementIds(): readonly EngagementId[] {
    return [...this._engagementIds];
  }
  get projectIds(): readonly ProjectId[] {
    return [...this._projectIds];
  }
  get sequence(): number {
    return this._sequence.value;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isArchived(): boolean {
    return this._status === ProgramStatus.ARCHIVED;
  }
  get isCompleted(): boolean {
    return this._status === ProgramStatus.COMPLETED;
  }

  addEngagement(id: EngagementId, now: Date = new Date()): void {
    this.assertEditable();
    if (!this._engagementIds.includes(id)) {
      this._engagementIds = [...this._engagementIds, id];
      this._updatedAt = now;
    }
  }

  removeEngagement(id: EngagementId, now: Date = new Date()): void {
    this.assertEditable();
    this._engagementIds = this._engagementIds.filter((x) => x !== id);
    this._updatedAt = now;
  }

  addProject(id: ProjectId, now: Date = new Date()): void {
    this.assertEditable();
    if (!this._projectIds.includes(id)) {
      this._projectIds = [...this._projectIds, id];
      this._updatedAt = now;
    }
  }

  removeProject(id: ProjectId, now: Date = new Date()): void {
    this.assertEditable();
    this._projectIds = this._projectIds.filter((x) => x !== id);
    this._updatedAt = now;
  }

  activate(now: Date = new Date()): void {
    this.transitionTo(ProgramStatus.ACTIVE, now);
  }

  complete(now: Date = new Date()): void {
    this.transitionTo(ProgramStatus.COMPLETED, now);
    this.record(
      ProgramCompleted.create({
        organizationId: this._organizationId,
        programId: this.id,
        portfolioId: this._portfolioId,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === ProgramStatus.ARCHIVED) {
      throw new InvalidPortfolioStateError("Program already archived.");
    }
    this.transitionTo(ProgramStatus.ARCHIVED, now);
  }

  toSnapshot(): ProgramSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      portfolioId: this._portfolioId,
      name: this._name.value,
      description: this._description.value,
      status: this._status,
      engagementIds: this._engagementIds.map(String),
      projectIds: this._projectIds.map(String),
      sequence: this._sequence.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: ProgramStatus, now: Date): void {
    this.assertEditable();
    if (!canTransitionProgram(this._status, to)) {
      throw new InvalidPortfolioStateError(
        `Cannot transition program from ${this._status} to ${to}.`,
      );
    }
    this._status = to;
    this._updatedAt = now;
  }

  private assertEditable(): void {
    if (this._status === ProgramStatus.ARCHIVED) {
      throw new InvalidPortfolioStateError(
        "Archived programs are immutable.",
      );
    }
  }
}
