import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { InvalidWorkingPatternError } from "../../errors/CapacityErrors.js";
import {
  WorkingPatternCreated,
  WorkingPatternUpdated,
} from "../../events/capacity-events.js";
import {
  asWorkingPatternId,
  type WorkingPatternId,
} from "../../types/ids.js";
import { HoursPerDay } from "../../value-objects/HoursPerDay.js";
import { HoursPerWeek } from "../../value-objects/HoursPerWeek.js";

export type CreateWorkingPatternProps = {
  organizationId: OrganizationId;
  hoursPerWeek: number;
  hoursPerDay: number;
  daysPerWeek: number;
  overtimeAllowed?: boolean;
  remoteAllowed?: boolean;
  id?: string;
  now?: Date;
};

export type WorkingPatternSnapshot = {
  id: WorkingPatternId;
  organizationId: OrganizationId;
  hoursPerWeek: number;
  hoursPerDay: number;
  daysPerWeek: number;
  overtimeAllowed: boolean;
  remoteAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function assertDaysPerWeek(days: number): void {
  if (!Number.isInteger(days) || days < 1 || days > 7) {
    throw new InvalidWorkingPatternError(
      `Days per week must be an integer between 1 and 7 (received ${days}).`,
    );
  }
}

export class WorkingPattern extends AggregateRoot<WorkingPatternId> {
  private constructor(
    id: WorkingPatternId,
    private readonly _organizationId: OrganizationId,
    private _hoursPerWeek: HoursPerWeek,
    private _hoursPerDay: HoursPerDay,
    private _daysPerWeek: number,
    private _overtimeAllowed: boolean,
    private _remoteAllowed: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateWorkingPatternProps): WorkingPattern {
    assertDaysPerWeek(props.daysPerWeek);
    const hoursPerWeek = HoursPerWeek.create(props.hoursPerWeek);
    const hoursPerDay = HoursPerDay.create(props.hoursPerDay);
    // Consistency: hoursPerWeek should not exceed days * hoursPerDay (soft check)
    if (hoursPerWeek.value > props.daysPerWeek * hoursPerDay.value + 0.001) {
      throw new InvalidWorkingPatternError(
        "Hours per week cannot exceed daysPerWeek × hoursPerDay.",
      );
    }
    const now = props.now ?? new Date();
    const id = asWorkingPatternId(props.id ?? generateId());

    const pattern = new WorkingPattern(
      id,
      props.organizationId,
      hoursPerWeek,
      hoursPerDay,
      props.daysPerWeek,
      props.overtimeAllowed ?? false,
      props.remoteAllowed ?? false,
      now,
      now,
    );

    pattern.record(
      WorkingPatternCreated.create({
        organizationId: props.organizationId,
        workingPatternId: id,
        hoursPerWeek: hoursPerWeek.value,
        daysPerWeek: props.daysPerWeek,
        occurredAt: now,
      }),
    );

    return pattern;
  }

  static reconstitute(snapshot: WorkingPatternSnapshot): WorkingPattern {
    return new WorkingPattern(
      snapshot.id,
      snapshot.organizationId,
      HoursPerWeek.create(snapshot.hoursPerWeek),
      HoursPerDay.create(snapshot.hoursPerDay),
      snapshot.daysPerWeek,
      snapshot.overtimeAllowed,
      snapshot.remoteAllowed,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get hoursPerWeek(): HoursPerWeek {
    return this._hoursPerWeek;
  }
  get hoursPerDay(): HoursPerDay {
    return this._hoursPerDay;
  }
  get daysPerWeek(): number {
    return this._daysPerWeek;
  }
  get overtimeAllowed(): boolean {
    return this._overtimeAllowed;
  }
  get remoteAllowed(): boolean {
    return this._remoteAllowed;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  update(props: {
    hoursPerWeek?: number;
    hoursPerDay?: number;
    daysPerWeek?: number;
    overtimeAllowed?: boolean;
    remoteAllowed?: boolean;
    now?: Date;
  }): void {
    const now = props.now ?? new Date();
    if (props.hoursPerWeek !== undefined) {
      this._hoursPerWeek = HoursPerWeek.create(props.hoursPerWeek);
    }
    if (props.hoursPerDay !== undefined) {
      this._hoursPerDay = HoursPerDay.create(props.hoursPerDay);
    }
    if (props.daysPerWeek !== undefined) {
      assertDaysPerWeek(props.daysPerWeek);
      this._daysPerWeek = props.daysPerWeek;
    }
    if (props.overtimeAllowed !== undefined) {
      this._overtimeAllowed = props.overtimeAllowed;
    }
    if (props.remoteAllowed !== undefined) {
      this._remoteAllowed = props.remoteAllowed;
    }
    if (
      this._hoursPerWeek.value >
      this._daysPerWeek * this._hoursPerDay.value + 0.001
    ) {
      throw new InvalidWorkingPatternError(
        "Hours per week cannot exceed daysPerWeek × hoursPerDay.",
      );
    }
    this._updatedAt = now;
    this.record(
      WorkingPatternUpdated.create({
        organizationId: this._organizationId,
        workingPatternId: this.id,
        hoursPerWeek: this._hoursPerWeek.value,
        hoursPerDay: this._hoursPerDay.value,
        daysPerWeek: this._daysPerWeek,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): WorkingPatternSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      hoursPerWeek: this._hoursPerWeek.value,
      hoursPerDay: this._hoursPerDay.value,
      daysPerWeek: this._daysPerWeek,
      overtimeAllowed: this._overtimeAllowed,
      remoteAllowed: this._remoteAllowed,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
