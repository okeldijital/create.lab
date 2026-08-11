import type { OrganizationId } from "@creative-lab/organization";
import {
  InvalidEmploymentPeriodError,
  InvalidManagerAssignmentError,
} from "../../errors/WorkforceErrors.js";
import {
  ManagerAssigned,
  ManagerChanged,
  ReportingRelationshipCreated,
  ReportingRelationshipEnded,
} from "../../events/reporting-events.js";
import { AggregateRoot } from "@creative-lab/core";
import {
  asReportingRelationshipId,
  type ReportingRelationshipId,
  type WorkerId,
} from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { isBeforeDay, startOfUtcDay } from "../../utils/dates.js";

export type CreateReportingRelationshipProps = {
  organizationId: OrganizationId;
  workerId: WorkerId;
  managerId: WorkerId;
  effectiveDate?: Date;
  previousManagerId?: WorkerId | null;
  id?: string;
  now?: Date;
};

export type ReportingRelationshipSnapshot = {
  id: ReportingRelationshipId;
  organizationId: OrganizationId;
  workerId: WorkerId;
  managerId: WorkerId;
  effectiveDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ReportingRelationship extends AggregateRoot<ReportingRelationshipId> {

  private constructor(
    id: ReportingRelationshipId,
    private readonly _organizationId: OrganizationId,
    private readonly _workerId: WorkerId,
    private readonly _managerId: WorkerId,
    private readonly _effectiveDate: Date,
    private _endDate: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(
    props: CreateReportingRelationshipProps,
  ): ReportingRelationship {
    if (props.workerId === props.managerId) {
      throw new InvalidManagerAssignmentError(
        "Manager cannot equal worker.",
      );
    }
    const effective = startOfUtcDay(props.effectiveDate ?? props.now ?? new Date());
    const now = props.now ?? new Date();
    const id = asReportingRelationshipId(props.id ?? generateId());

    const rel = new ReportingRelationship(
      id,
      props.organizationId,
      props.workerId,
      props.managerId,
      effective,
      null,
      now,
      now,
    );

    rel.record(
      ReportingRelationshipCreated.create({
        organizationId: props.organizationId,
        relationshipId: id,
        workerId: props.workerId,
        managerId: props.managerId,
        effectiveDate: effective,
        occurredAt: now,
      }),
    );

    if (props.previousManagerId !== undefined) {
      rel.record(
        ManagerChanged.create({
          organizationId: props.organizationId,
          workerId: props.workerId,
          previousManagerId: props.previousManagerId,
          managerId: props.managerId,
          relationshipId: id,
          occurredAt: now,
        }),
      );
    } else {
      rel.record(
        ManagerAssigned.create({
          organizationId: props.organizationId,
          workerId: props.workerId,
          managerId: props.managerId,
          relationshipId: id,
          occurredAt: now,
        }),
      );
    }

    return rel;
  }

  static reconstitute(
    snapshot: ReportingRelationshipSnapshot,
  ): ReportingRelationship {
    return new ReportingRelationship(
      snapshot.id,
      snapshot.organizationId,
      snapshot.workerId,
      snapshot.managerId,
      new Date(snapshot.effectiveDate),
      snapshot.endDate ? new Date(snapshot.endDate) : null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }
  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get workerId(): WorkerId {
    return this._workerId;
  }
  get managerId(): WorkerId {
    return this._managerId;
  }
  get effectiveDate(): Date {
    return new Date(this._effectiveDate);
  }
  get endDate(): Date | null {
    return this._endDate ? new Date(this._endDate) : null;
  }
  get isActive(): boolean {
    return this._endDate === null;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  end(endDate: Date = new Date(), now: Date = new Date()): void {
    if (!this.isActive) {
      throw new InvalidManagerAssignmentError(
        "Reporting relationship is already ended.",
      );
    }
    const end = startOfUtcDay(endDate);
    if (isBeforeDay(end, this._effectiveDate)) {
      throw new InvalidEmploymentPeriodError(
        "Reporting relationship end date cannot precede effective date.",
      );
    }
    this._endDate = end;
    this._updatedAt = now;
    this.record(
      ReportingRelationshipEnded.create({
        organizationId: this._organizationId,
        relationshipId: this.id,
        workerId: this._workerId,
        managerId: this._managerId,
        endDate: end,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ReportingRelationshipSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      workerId: this._workerId,
      managerId: this._managerId,
      effectiveDate: new Date(this._effectiveDate),
      endDate: this._endDate ? new Date(this._endDate) : null,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
