import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { OutputStatus } from "../../enums/OutputStatus.js";
import { OutputType } from "../../enums/OutputType.js";
import {
  InvalidWorkStateError,
  OutputVersionConflictError,
} from "../../errors/OperationsErrors.js";
import {
  OutputApproved,
  OutputCreated,
} from "../../events/operations-events.js";
import {
  asWorkOutputId,
  type WorkOrderId,
  type WorkOutputId,
} from "../../types/ids.js";
import { OutputName } from "../../value-objects/OutputName.js";
import { OutputVersion } from "../../value-objects/OutputVersion.js";

export type CreateWorkOutputProps = {
  organizationId: OrganizationId;
  workOrderId: WorkOrderId;
  name: string;
  outputType: OutputType;
  /** Defaults to 1; use service for auto-increment per name. */
  version?: number;
  id?: string;
  now?: Date;
};

export type WorkOutputSnapshot = {
  id: WorkOutputId;
  organizationId: OrganizationId;
  workOrderId: WorkOrderId;
  name: string;
  outputType: OutputType;
  version: number;
  status: OutputStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Produced output metadata only — no file storage.
 * Core identity fields are immutable; status may advance along the review pipeline.
 */
export class WorkOutput extends AggregateRoot<WorkOutputId> {
  private constructor(
    id: WorkOutputId,
    private readonly _organizationId: OrganizationId,
    private readonly _workOrderId: WorkOrderId,
    private readonly _name: OutputName,
    private readonly _outputType: OutputType,
    private readonly _version: OutputVersion,
    private _status: OutputStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateWorkOutputProps): WorkOutput {
    if (!props.workOrderId) {
      throw new InvalidWorkStateError("Output requires a work order.");
    }
    if (!Object.values(OutputType).includes(props.outputType)) {
      throw new InvalidWorkStateError(
        `Invalid output type: ${String(props.outputType)}`,
      );
    }
    const version =
      props.version !== undefined
        ? OutputVersion.create(props.version)
        : OutputVersion.first();
    const now = props.now ?? new Date();
    const id = asWorkOutputId(props.id ?? generateId());
    const output = new WorkOutput(
      id,
      props.organizationId,
      props.workOrderId,
      OutputName.create(props.name),
      props.outputType,
      version,
      OutputStatus.DRAFT,
      now,
      now,
    );
    output.record(
      OutputCreated.create({
        organizationId: props.organizationId,
        outputId: id,
        workOrderId: props.workOrderId,
        name: output._name.value,
        version: version.value,
        outputType: props.outputType,
        occurredAt: now,
      }),
    );
    return output;
  }

  static reconstitute(snapshot: WorkOutputSnapshot): WorkOutput {
    return new WorkOutput(
      snapshot.id,
      snapshot.organizationId,
      snapshot.workOrderId,
      OutputName.create(snapshot.name),
      snapshot.outputType,
      OutputVersion.create(snapshot.version),
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get workOrderId(): WorkOrderId {
    return this._workOrderId;
  }
  get name(): OutputName {
    return this._name;
  }
  get outputType(): OutputType {
    return this._outputType;
  }
  get version(): OutputVersion {
    return this._version;
  }
  get status(): OutputStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  submitForReview(now: Date = new Date()): void {
    this.advanceStatus(OutputStatus.REVIEW, now);
  }

  approve(now: Date = new Date()): void {
    this.advanceStatus(OutputStatus.APPROVED, now);
    this.record(
      OutputApproved.create({
        organizationId: this._organizationId,
        outputId: this.id,
        workOrderId: this._workOrderId,
        version: this._version.value,
        occurredAt: now,
      }),
    );
  }

  deliver(now: Date = new Date()): void {
    this.advanceStatus(OutputStatus.DELIVERED, now);
  }

  archive(now: Date = new Date()): void {
    this.advanceStatus(OutputStatus.ARCHIVED, now);
  }

  toSnapshot(): WorkOutputSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      workOrderId: this._workOrderId,
      name: this._name.value,
      outputType: this._outputType,
      version: this._version.value,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private advanceStatus(to: OutputStatus, now: Date): void {
    const allowed = OUTPUT_STATUS_TRANSITIONS[this._status];
    if (!allowed.includes(to)) {
      throw new OutputVersionConflictError(
        `Cannot transition output from ${this._status} to ${to}.`,
      );
    }
    this._status = to;
    this._updatedAt = now;
  }
}

const OUTPUT_STATUS_TRANSITIONS: Readonly<
  Record<OutputStatus, readonly OutputStatus[]>
> = {
  [OutputStatus.DRAFT]: [OutputStatus.REVIEW, OutputStatus.ARCHIVED],
  [OutputStatus.REVIEW]: [
    OutputStatus.APPROVED,
    OutputStatus.DRAFT,
    OutputStatus.ARCHIVED,
  ],
  [OutputStatus.APPROVED]: [OutputStatus.DELIVERED, OutputStatus.ARCHIVED],
  [OutputStatus.DELIVERED]: [OutputStatus.ARCHIVED],
  [OutputStatus.ARCHIVED]: [],
};
