import { AggregateRoot, generateId } from "@creative-lab/core";
import type { WorkingPatternId } from "@creative-lab/capacity";
import type { OrganizationId } from "@creative-lab/organization";
import { ShiftType } from "../../enums/ShiftType.js";
import { InvalidShiftError } from "../../errors/SchedulingErrors.js";
import {
  ShiftCreated,
  ShiftUpdated,
} from "../../events/scheduling-events.js";
import { asShiftId, type ShiftId } from "../../types/ids.js";
import { durationMinutes } from "../../utils/time.js";
import { WorkingTime } from "../../value-objects/WorkingTime.js";

export type CreateShiftProps = {
  organizationId: OrganizationId;
  name: string;
  startTime: string;
  endTime: string;
  workingPatternId: WorkingPatternId;
  shiftType?: ShiftType;
  id?: string;
  now?: Date;
};

export type ShiftSnapshot = {
  id: ShiftId;
  organizationId: OrganizationId;
  name: string;
  startTime: string;
  endTime: string;
  workingPatternId: WorkingPatternId;
  shiftType: ShiftType;
  createdAt: Date;
  updatedAt: Date;
};

export class Shift extends AggregateRoot<ShiftId> {
  private constructor(
    id: ShiftId,
    private readonly _organizationId: OrganizationId,
    private _name: string,
    private _startTime: WorkingTime,
    private _endTime: WorkingTime,
    private readonly _workingPatternId: WorkingPatternId,
    private _shiftType: ShiftType,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateShiftProps): Shift {
    const name = props.name?.trim();
    if (!name) {
      throw new InvalidShiftError("Shift name is required.");
    }
    const startTime = WorkingTime.create(props.startTime);
    const endTime = WorkingTime.create(props.endTime);
    const minutes = durationMinutes(startTime.value, endTime.value);
    if (minutes <= 0) {
      throw new InvalidShiftError(
        "Shift duration must be positive (overnight shifts require different start/end).",
      );
    }
    const shiftType = props.shiftType ?? ShiftType.CUSTOM;
    if (!Object.values(ShiftType).includes(shiftType)) {
      throw new InvalidShiftError(`Invalid shift type: ${String(shiftType)}`);
    }
    const now = props.now ?? new Date();
    const id = asShiftId(props.id ?? generateId());
    const shift = new Shift(
      id,
      props.organizationId,
      name,
      startTime,
      endTime,
      props.workingPatternId,
      shiftType,
      now,
      now,
    );
    shift.record(
      ShiftCreated.create({
        organizationId: props.organizationId,
        shiftId: id,
        name,
        startTime: startTime.value,
        endTime: endTime.value,
        occurredAt: now,
      }),
    );
    return shift;
  }

  static reconstitute(snapshot: ShiftSnapshot): Shift {
    return new Shift(
      snapshot.id,
      snapshot.organizationId,
      snapshot.name,
      WorkingTime.create(snapshot.startTime),
      WorkingTime.create(snapshot.endTime),
      snapshot.workingPatternId,
      snapshot.shiftType,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): string {
    return this._name;
  }
  get startTime(): WorkingTime {
    return this._startTime;
  }
  get endTime(): WorkingTime {
    return this._endTime;
  }
  get workingPatternId(): WorkingPatternId {
    return this._workingPatternId;
  }
  get shiftType(): ShiftType {
    return this._shiftType;
  }
  get durationMinutes(): number {
    return durationMinutes(this._startTime.value, this._endTime.value);
  }
  get isOvernight(): boolean {
    return (
      this._endTime.minutesSinceMidnight < this._startTime.minutesSinceMidnight
    );
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  update(props: {
    name?: string;
    startTime?: string;
    endTime?: string;
    shiftType?: ShiftType;
    now?: Date;
  }): void {
    const now = props.now ?? new Date();
    if (props.name !== undefined) {
      const name = props.name.trim();
      if (!name) throw new InvalidShiftError("Shift name is required.");
      this._name = name;
    }
    if (props.startTime !== undefined) {
      this._startTime = WorkingTime.create(props.startTime);
    }
    if (props.endTime !== undefined) {
      this._endTime = WorkingTime.create(props.endTime);
    }
    if (props.shiftType !== undefined) {
      this._shiftType = props.shiftType;
    }
    if (durationMinutes(this._startTime.value, this._endTime.value) <= 0) {
      throw new InvalidShiftError("Shift duration must be positive.");
    }
    this._updatedAt = now;
    this.record(
      ShiftUpdated.create({
        organizationId: this._organizationId,
        shiftId: this.id,
        name: this._name,
        startTime: this._startTime.value,
        endTime: this._endTime.value,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ShiftSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name,
      startTime: this._startTime.value,
      endTime: this._endTime.value,
      workingPatternId: this._workingPatternId,
      shiftType: this._shiftType,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
