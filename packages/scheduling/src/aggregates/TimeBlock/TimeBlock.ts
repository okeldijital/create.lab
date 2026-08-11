import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { TimeBlockStatus } from "../../enums/TimeBlockStatus.js";
import { TimeBlockType } from "../../enums/TimeBlockType.js";
import {
  InvalidTimeRangeError,
  ScheduleValidationError,
} from "../../errors/SchedulingErrors.js";
import {
  TimeBlockCreated,
  TimeBlockRemoved,
} from "../../events/scheduling-events.js";
import {
  asTimeBlockId,
  type ScheduleId,
  type TimeBlockId,
} from "../../types/ids.js";
import { TimeRange } from "../../value-objects/TimeRange.js";

export type CreateTimeBlockProps = {
  organizationId: OrganizationId;
  scheduleId: ScheduleId;
  start: Date;
  end: Date;
  type: TimeBlockType;
  id?: string;
  now?: Date;
};

export type TimeBlockSnapshot = {
  id: TimeBlockId;
  organizationId: OrganizationId;
  scheduleId: ScheduleId;
  start: Date;
  end: Date;
  type: TimeBlockType;
  status: TimeBlockStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class TimeBlock extends AggregateRoot<TimeBlockId> {
  private constructor(
    id: TimeBlockId,
    private readonly _organizationId: OrganizationId,
    private readonly _scheduleId: ScheduleId,
    private readonly _range: TimeRange,
    private readonly _type: TimeBlockType,
    private _status: TimeBlockStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateTimeBlockProps): TimeBlock {
    if (!Object.values(TimeBlockType).includes(props.type)) {
      throw new InvalidTimeRangeError(
        `Invalid time block type: ${String(props.type)}`,
      );
    }
    const range = TimeRange.create(props.start, props.end);
    const now = props.now ?? new Date();
    const id = asTimeBlockId(props.id ?? generateId());
    const block = new TimeBlock(
      id,
      props.organizationId,
      props.scheduleId,
      range,
      props.type,
      TimeBlockStatus.OPEN,
      now,
      now,
    );
    block.record(
      TimeBlockCreated.create({
        organizationId: props.organizationId,
        timeBlockId: id,
        scheduleId: props.scheduleId,
        start: range.start,
        end: range.end,
        type: props.type,
        occurredAt: now,
      }),
    );
    return block;
  }

  static reconstitute(snapshot: TimeBlockSnapshot): TimeBlock {
    return new TimeBlock(
      snapshot.id,
      snapshot.organizationId,
      snapshot.scheduleId,
      TimeRange.create(snapshot.start, snapshot.end),
      snapshot.type,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get scheduleId(): ScheduleId {
    return this._scheduleId;
  }
  get range(): TimeRange {
    return this._range;
  }
  get start(): Date {
    return this._range.start;
  }
  get end(): Date {
    return this._range.end;
  }
  get type(): TimeBlockType {
    return this._type;
  }
  get status(): TimeBlockStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get isOpen(): boolean {
    return this._status === TimeBlockStatus.OPEN;
  }
  get isCompleted(): boolean {
    return this._status === TimeBlockStatus.COMPLETED;
  }

  complete(now: Date = new Date()): void {
    this.assertMutable();
    this._status = TimeBlockStatus.COMPLETED;
    this._updatedAt = now;
  }

  remove(now: Date = new Date()): void {
    this.assertMutable();
    this._status = TimeBlockStatus.REMOVED;
    this._updatedAt = now;
    this.record(
      TimeBlockRemoved.create({
        organizationId: this._organizationId,
        timeBlockId: this.id,
        scheduleId: this._scheduleId,
        occurredAt: now,
      }),
    );
  }

  private assertMutable(): void {
    if (this._status === TimeBlockStatus.COMPLETED) {
      throw new ScheduleValidationError(
        "Completed time blocks are immutable.",
      );
    }
    if (this._status === TimeBlockStatus.REMOVED) {
      throw new ScheduleValidationError("Removed time blocks cannot be modified.");
    }
  }

  toSnapshot(): TimeBlockSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      scheduleId: this._scheduleId,
      start: this._range.start,
      end: this._range.end,
      type: this._type,
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
