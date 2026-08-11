import type { OrganizationId } from "@creative-lab/organization";
import {
  EmploymentStatus,
  isActiveEmploymentStatus,
} from "../../enums/EmploymentStatus.js";
import type { EmploymentType } from "../../enums/EmploymentType.js";
import {
  EmploymentConflictError,
  InvalidEmploymentPeriodError,
} from "../../errors/WorkforceErrors.js";
import {
  EmploymentEnded,
  EmploymentStarted,
  EmploymentUpdated,
} from "../../events/employment-events.js";
import { AggregateRoot } from "@creative-lab/core";
import {
  asEmploymentId,
  type EmploymentId,
  type WorkerId,
} from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { EmploymentPeriod } from "../../value-objects/EmploymentPeriod.js";
import { WorkingHours } from "../../value-objects/WorkingHours.js";
import { NoticePeriod } from "../../value-objects/NoticePeriod.js";
import { ProbationPeriod } from "../../value-objects/ProbationPeriod.js";

export type CreateEmploymentProps = {
  workerId: WorkerId;
  organizationId: OrganizationId;
  employmentType: EmploymentType;
  startDate: Date;
  endDate?: Date | null;
  workingHours?: number;
  probationDays?: number;
  noticePeriodDays?: number;
  onProbation?: boolean;
  id?: string;
  now?: Date;
};

export type EmploymentSnapshot = {
  id: EmploymentId;
  workerId: WorkerId;
  organizationId: OrganizationId;
  employmentType: EmploymentType;
  startDate: Date;
  endDate: Date | null;
  status: EmploymentStatus;
  workingHoursPerWeek: number;
  probationDays: number;
  probationActive: boolean;
  noticePeriodDays: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Employment extends AggregateRoot<EmploymentId> {

  private constructor(
    id: EmploymentId,
    private readonly _workerId: WorkerId,
    private readonly _organizationId: OrganizationId,
    private _employmentType: EmploymentType,
    private _period: EmploymentPeriod,
    private _status: EmploymentStatus,
    private _workingHours: WorkingHours,
    private _probation: ProbationPeriod,
    private _noticePeriod: NoticePeriod,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateEmploymentProps): Employment {
    const period = EmploymentPeriod.create(
      props.startDate,
      props.endDate ?? null,
    );
    const workingHours = WorkingHours.create(props.workingHours ?? 40);
    const probation =
      props.onProbation === false
        ? ProbationPeriod.none()
        : ProbationPeriod.create(props.probationDays ?? 90, true);
    const noticePeriod = NoticePeriod.create(props.noticePeriodDays ?? 30);
    const now = props.now ?? new Date();
    const id = asEmploymentId(props.id ?? generateId());
    const status = probation.active
      ? EmploymentStatus.PROBATION
      : EmploymentStatus.ACTIVE;

    const employment = new Employment(
      id,
      props.workerId,
      props.organizationId,
      props.employmentType,
      period,
      status,
      workingHours,
      probation,
      noticePeriod,
      now,
      now,
    );

    employment.record(
      EmploymentStarted.create({
        organizationId: props.organizationId,
        employmentId: id,
        workerId: props.workerId,
        employmentType: props.employmentType,
        startDate: period.startDate,
        status,
        occurredAt: now,
      }),
    );

    return employment;
  }

  static reconstitute(snapshot: EmploymentSnapshot): Employment {
    return new Employment(
      snapshot.id,
      snapshot.workerId,
      snapshot.organizationId,
      snapshot.employmentType,
      EmploymentPeriod.create(snapshot.startDate, snapshot.endDate),
      snapshot.status,
      WorkingHours.create(snapshot.workingHoursPerWeek),
      ProbationPeriod.create(snapshot.probationDays, snapshot.probationActive),
      NoticePeriod.create(snapshot.noticePeriodDays),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }
  get workerId(): WorkerId {
    return this._workerId;
  }
  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get employmentType(): EmploymentType {
    return this._employmentType;
  }
  get period(): EmploymentPeriod {
    return this._period;
  }
  get startDate(): Date {
    return this._period.startDate;
  }
  get endDate(): Date | null {
    return this._period.endDate;
  }
  get status(): EmploymentStatus {
    return this._status;
  }
  get workingHours(): WorkingHours {
    return this._workingHours;
  }
  get probation(): ProbationPeriod {
    return this._probation;
  }
  get noticePeriod(): NoticePeriod {
    return this._noticePeriod;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get isActive(): boolean {
    return isActiveEmploymentStatus(this._status);
  }

  update(props: {
    employmentType?: EmploymentType;
    endDate?: Date | null;
    workingHours?: number;
    noticePeriodDays?: number;
    status?: EmploymentStatus;
    completeProbation?: boolean;
    now?: Date;
  }): void {
    if (!this.isActive && props.status === undefined) {
      throw new EmploymentConflictError(
        "Inactive employment cannot be updated except via status transitions.",
      );
    }
    const now = props.now ?? new Date();
    if (props.employmentType !== undefined) {
      this._employmentType = props.employmentType;
    }
    if (props.endDate !== undefined) {
      this._period = EmploymentPeriod.create(
        this._period.startDate,
        props.endDate,
      );
    }
    if (props.workingHours !== undefined) {
      this._workingHours = WorkingHours.create(props.workingHours);
    }
    if (props.noticePeriodDays !== undefined) {
      this._noticePeriod = NoticePeriod.create(props.noticePeriodDays);
    }
    if (props.completeProbation) {
      this._probation = ProbationPeriod.create(this._probation.days, false);
      if (this._status === EmploymentStatus.PROBATION) {
        this._status = EmploymentStatus.ACTIVE;
      }
    }
    if (props.status !== undefined) {
      if (
        props.status === EmploymentStatus.ENDED ||
        props.status === EmploymentStatus.TERMINATED
      ) {
        this.end(props.endDate ?? now, props.status, now);
        return;
      }
      this._status = props.status;
    }
    this._updatedAt = now;
    this.record(
      EmploymentUpdated.create({
        organizationId: this._organizationId,
        employmentId: this.id,
        workerId: this._workerId,
        status: this._status,
        endDate: this._period.endDate,
        occurredAt: now,
      }),
    );
  }

  end(
    endDate: Date,
    status: EmploymentStatus = EmploymentStatus.ENDED,
    now: Date = new Date(),
  ): void {
    if (!this.isActive) {
      throw new EmploymentConflictError("Employment is already ended.");
    }
    if (
      status !== EmploymentStatus.ENDED &&
      status !== EmploymentStatus.TERMINATED
    ) {
      throw new InvalidEmploymentPeriodError(
        "Employment end status must be ENDED or TERMINATED.",
      );
    }
    this._period = EmploymentPeriod.create(this._period.startDate, endDate);
    this._status = status;
    this._updatedAt = now;
    this.record(
      EmploymentEnded.create({
        organizationId: this._organizationId,
        employmentId: this.id,
        workerId: this._workerId,
        endDate,
        status,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): EmploymentSnapshot {
    return {
      id: this.id,
      workerId: this._workerId,
      organizationId: this._organizationId,
      employmentType: this._employmentType,
      startDate: this._period.startDate,
      endDate: this._period.endDate,
      status: this._status,
      workingHoursPerWeek: this._workingHours.hoursPerWeek,
      probationDays: this._probation.days,
      probationActive: this._probation.active,
      noticePeriodDays: this._noticePeriod.days,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
