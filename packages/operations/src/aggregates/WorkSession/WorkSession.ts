import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { SessionStatus } from "../../enums/SessionStatus.js";
import { InvalidWorkStateError } from "../../errors/OperationsErrors.js";
import {
  SessionEnded,
  SessionStarted,
} from "../../events/operations-events.js";
import {
  asWorkSessionId,
  type WorkOrderId,
  type WorkSessionId,
} from "../../types/ids.js";
import { SessionDuration } from "../../value-objects/SessionDuration.js";

export type CreateWorkSessionProps = {
  organizationId: OrganizationId;
  workOrderId: WorkOrderId;
  startedAt?: Date;
  notes?: string | null;
  id?: string;
  now?: Date;
};

export type WorkSessionSnapshot = {
  id: WorkSessionId;
  organizationId: OrganizationId;
  workOrderId: WorkOrderId;
  startedAt: Date;
  endedAt: Date | null;
  status: SessionStatus;
  durationMs: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Execution session belonging to a single WorkOrder.
 * Sessions may not overlap (enforced by SessionPolicy / WorkSessionService).
 */
export class WorkSession extends AggregateRoot<WorkSessionId> {
  private constructor(
    id: WorkSessionId,
    private readonly _organizationId: OrganizationId,
    private readonly _workOrderId: WorkOrderId,
    private readonly _startedAt: Date,
    private _endedAt: Date | null,
    private _status: SessionStatus,
    private _duration: SessionDuration | null,
    private _notes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateWorkSessionProps): WorkSession {
    if (!props.workOrderId) {
      throw new InvalidWorkStateError("Session requires a work order.");
    }
    const now = props.now ?? new Date();
    const startedAt = props.startedAt ? new Date(props.startedAt) : now;
    if (Number.isNaN(startedAt.getTime())) {
      throw new InvalidWorkStateError("Session startedAt must be a valid date.");
    }
    const id = asWorkSessionId(props.id ?? generateId());
    const notes =
      props.notes === null || props.notes === undefined
        ? null
        : props.notes.trim() || null;
    if (notes && notes.length > 2000) {
      throw new InvalidWorkStateError(
        "Session notes must be at most 2000 characters.",
      );
    }
    const session = new WorkSession(
      id,
      props.organizationId,
      props.workOrderId,
      startedAt,
      null,
      SessionStatus.ACTIVE,
      null,
      notes,
      now,
      now,
    );
    session.record(
      SessionStarted.create({
        organizationId: props.organizationId,
        sessionId: id,
        workOrderId: props.workOrderId,
        startedAt,
        occurredAt: now,
      }),
    );
    return session;
  }

  static reconstitute(snapshot: WorkSessionSnapshot): WorkSession {
    return new WorkSession(
      snapshot.id,
      snapshot.organizationId,
      snapshot.workOrderId,
      new Date(snapshot.startedAt),
      snapshot.endedAt ? new Date(snapshot.endedAt) : null,
      snapshot.status,
      snapshot.durationMs != null
        ? SessionDuration.fromMilliseconds(snapshot.durationMs)
        : null,
      snapshot.notes,
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
  get startedAt(): Date {
    return new Date(this._startedAt);
  }
  get endedAt(): Date | null {
    return this._endedAt ? new Date(this._endedAt) : null;
  }
  get status(): SessionStatus {
    return this._status;
  }
  get duration(): SessionDuration | null {
    return this._duration;
  }
  get durationMs(): number | null {
    return this._duration?.milliseconds ?? null;
  }
  get notes(): string | null {
    return this._notes;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isOpen(): boolean {
    return (
      this._status === SessionStatus.ACTIVE ||
      this._status === SessionStatus.PAUSED
    );
  }

  /** Half-open interval for overlap checks: [startedAt, effectiveEnd). */
  get effectiveEnd(): Date {
    if (this._endedAt) return new Date(this._endedAt);
    // Open sessions treated as extending to "now" for overlap by callers;
    // use far-future sentinel when comparing two open sessions without now.
    return new Date(Number.MAX_SAFE_INTEGER);
  }

  pause(now: Date = new Date()): void {
    if (this._status !== SessionStatus.ACTIVE) {
      throw new InvalidWorkStateError(
        `Only ACTIVE sessions can be paused (status: ${this._status}).`,
      );
    }
    this._status = SessionStatus.PAUSED;
    this._updatedAt = now;
  }

  resume(now: Date = new Date()): void {
    if (this._status !== SessionStatus.PAUSED) {
      throw new InvalidWorkStateError(
        `Only PAUSED sessions can be resumed (status: ${this._status}).`,
      );
    }
    this._status = SessionStatus.ACTIVE;
    this._updatedAt = now;
  }

  end(endedAt: Date = new Date(), now: Date = endedAt): void {
    if (this._status === SessionStatus.COMPLETED) {
      throw new InvalidWorkStateError("Session is already completed.");
    }
    const end = new Date(endedAt);
    if (Number.isNaN(end.getTime())) {
      throw new InvalidWorkStateError("Session endedAt must be a valid date.");
    }
    if (end.getTime() <= this._startedAt.getTime()) {
      throw new InvalidWorkStateError(
        "Session end must be after session start (positive duration).",
      );
    }
    const duration = SessionDuration.between(this._startedAt, end);
    this._endedAt = end;
    this._duration = duration;
    this._status = SessionStatus.COMPLETED;
    this._updatedAt = now;
    this.record(
      SessionEnded.create({
        organizationId: this._organizationId,
        sessionId: this.id,
        workOrderId: this._workOrderId,
        endedAt: end,
        durationMs: duration.milliseconds,
        occurredAt: now,
      }),
    );
  }

  updateNotes(notes: string | null, now: Date = new Date()): void {
    if (this._status === SessionStatus.COMPLETED) {
      throw new InvalidWorkStateError(
        "Completed sessions cannot have notes updated.",
      );
    }
    if (notes === null || notes === undefined) {
      this._notes = null;
    } else {
      const trimmed = notes.trim();
      if (trimmed.length > 2000) {
        throw new InvalidWorkStateError(
          "Session notes must be at most 2000 characters.",
        );
      }
      this._notes = trimmed || null;
    }
    this._updatedAt = now;
  }

  toSnapshot(): WorkSessionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      workOrderId: this._workOrderId,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      status: this._status,
      durationMs: this.durationMs,
      notes: this._notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
