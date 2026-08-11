import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import {
  SessionStatus,
  canTransitionSession,
  isOpenSessionStatus,
} from "../../enums/SessionStatus.js";
import {
  InvalidSessionError,
  SessionNotOpenError,
} from "../../errors/ProductionErrors.js";
import {
  SessionCompleted,
  SessionOpened,
  SessionPaused,
  SessionResumed,
} from "../../events/production-events.js";
import {
  asProductionSessionId,
  type ProductionId,
  type ProductionSessionId,
} from "../../types/ids.js";
import { SessionDuration } from "../../value-objects/SessionDuration.js";
import { SessionNotes } from "../../value-objects/SessionNotes.js";

export type CreateProductionSessionProps = {
  organizationId: OrganizationId;
  productionId: ProductionId;
  startedAt?: Date;
  notes?: string | null;
  id?: string;
  now?: Date;
};

export type ProductionSessionSnapshot = {
  id: ProductionSessionId;
  organizationId: OrganizationId;
  productionId: ProductionId;
  startedAt: Date;
  endedAt: Date | null;
  notes: string | null;
  durationMs: number | null;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Individual working session on a production.
 * OPEN → PAUSED → RESUMED → COMPLETED; only one open session per production (policy).
 */
export class ProductionSession extends AggregateRoot<ProductionSessionId> {
  private constructor(
    id: ProductionSessionId,
    private readonly _organizationId: OrganizationId,
    private readonly _productionId: ProductionId,
    private readonly _startedAt: Date,
    private _endedAt: Date | null,
    private _notes: SessionNotes,
    private _duration: SessionDuration | null,
    private _status: SessionStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateProductionSessionProps): ProductionSession {
    if (!props.productionId) {
      throw new InvalidSessionError("Session requires a production.");
    }
    const now = props.now ?? new Date();
    const startedAt = props.startedAt ? new Date(props.startedAt) : now;
    if (Number.isNaN(startedAt.getTime())) {
      throw new InvalidSessionError("Session startedAt must be a valid date.");
    }
    const id = asProductionSessionId(props.id ?? generateId());
    const session = new ProductionSession(
      id,
      props.organizationId,
      props.productionId,
      startedAt,
      null,
      SessionNotes.create(props.notes),
      null,
      SessionStatus.OPEN,
      now,
      now,
    );
    session.record(
      SessionOpened.create({
        organizationId: props.organizationId,
        sessionId: id,
        productionId: props.productionId,
        startedAt,
        occurredAt: now,
      }),
    );
    return session;
  }

  static reconstitute(
    snapshot: ProductionSessionSnapshot,
  ): ProductionSession {
    return new ProductionSession(
      snapshot.id,
      snapshot.organizationId,
      snapshot.productionId,
      new Date(snapshot.startedAt),
      snapshot.endedAt ? new Date(snapshot.endedAt) : null,
      SessionNotes.create(snapshot.notes),
      snapshot.durationMs != null
        ? SessionDuration.fromMilliseconds(snapshot.durationMs)
        : null,
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get productionId(): ProductionId {
    return this._productionId;
  }
  get startedAt(): Date {
    return new Date(this._startedAt);
  }
  get endedAt(): Date | null {
    return this._endedAt ? new Date(this._endedAt) : null;
  }
  get notes(): SessionNotes {
    return this._notes;
  }
  get duration(): SessionDuration | null {
    return this._duration;
  }
  get durationMs(): number | null {
    return this._duration?.milliseconds ?? null;
  }
  get status(): SessionStatus {
    return this._status;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isOpen(): boolean {
    return isOpenSessionStatus(this._status);
  }

  pause(now: Date = new Date()): void {
    this.transitionTo(SessionStatus.PAUSED, now);
    this.record(
      SessionPaused.create({
        organizationId: this._organizationId,
        sessionId: this.id,
        productionId: this._productionId,
        occurredAt: now,
      }),
    );
  }

  resume(now: Date = new Date()): void {
    this.transitionTo(SessionStatus.RESUMED, now);
    this.record(
      SessionResumed.create({
        organizationId: this._organizationId,
        sessionId: this.id,
        productionId: this._productionId,
        occurredAt: now,
      }),
    );
  }

  complete(endedAt: Date = new Date(), now: Date = endedAt): void {
    if (this._status === SessionStatus.COMPLETED) {
      throw new InvalidSessionError("Session is already completed.");
    }
    if (!isOpenSessionStatus(this._status)) {
      throw new SessionNotOpenError(
        `Session is not open (status: ${this._status}).`,
      );
    }
    const end = new Date(endedAt);
    if (Number.isNaN(end.getTime())) {
      throw new InvalidSessionError("Session endedAt must be a valid date.");
    }
    if (end.getTime() <= this._startedAt.getTime()) {
      throw new InvalidSessionError(
        "Session end must be after start (positive duration).",
      );
    }
    const duration = SessionDuration.between(this._startedAt, end);
    this._endedAt = end;
    this._duration = duration;
    this._status = SessionStatus.COMPLETED;
    this._updatedAt = now;
    this.record(
      SessionCompleted.create({
        organizationId: this._organizationId,
        sessionId: this.id,
        productionId: this._productionId,
        endedAt: end,
        durationMs: duration.milliseconds,
        occurredAt: now,
      }),
    );
  }

  updateNotes(notes: string | null, now: Date = new Date()): void {
    if (this._status === SessionStatus.COMPLETED) {
      throw new InvalidSessionError(
        "Completed sessions are immutable.",
      );
    }
    this._notes = SessionNotes.create(notes);
    this._updatedAt = now;
  }

  toSnapshot(): ProductionSessionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      productionId: this._productionId,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      notes: this._notes.value,
      durationMs: this.durationMs,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private transitionTo(to: SessionStatus, now: Date): void {
    if (this._status === SessionStatus.COMPLETED) {
      throw new InvalidSessionError("Completed sessions are immutable.");
    }
    if (!canTransitionSession(this._status, to)) {
      throw new InvalidSessionError(
        `Cannot transition session from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }
}
