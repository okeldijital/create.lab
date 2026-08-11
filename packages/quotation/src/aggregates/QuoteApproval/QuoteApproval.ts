import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ApprovalStatus } from "../../enums/ApprovalStatus.js";
import { QuoteApprovalError } from "../../errors/QuotationErrors.js";
import { QuoteApprovalRecorded } from "../../events/quotation-events.js";
import {
  asQuoteApprovalId,
  type QuoteApprovalId,
  type QuoteId,
} from "../../types/ids.js";
import { QuoteNotes } from "../../value-objects/QuoteNotes.js";

export type CreateQuoteApprovalProps = {
  organizationId: OrganizationId;
  quoteId: QuoteId;
  notes?: string | null;
  id?: string;
  now?: Date;
};

export type QuoteApprovalSnapshot = {
  id: QuoteApprovalId;
  organizationId: OrganizationId;
  quoteId: QuoteId;
  decision: ApprovalStatus;
  decisionDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Customer response. Immutable after accept/decline.
 */
export class QuoteApproval extends AggregateRoot<QuoteApprovalId> {
  private constructor(
    id: QuoteApprovalId,
    private readonly _organizationId: OrganizationId,
    private readonly _quoteId: QuoteId,
    private _decision: ApprovalStatus,
    private _decisionDate: Date | null,
    private readonly _notes: QuoteNotes,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateQuoteApprovalProps): QuoteApproval {
    if (!props.quoteId) {
      throw new QuoteApprovalError("Approval requires a quote.");
    }
    const now = props.now ?? new Date();
    const id = asQuoteApprovalId(props.id ?? generateId());
    return new QuoteApproval(
      id,
      props.organizationId,
      props.quoteId,
      ApprovalStatus.PENDING,
      null,
      QuoteNotes.create(props.notes),
      now,
      now,
    );
  }

  static reconstitute(snapshot: QuoteApprovalSnapshot): QuoteApproval {
    return new QuoteApproval(
      snapshot.id,
      snapshot.organizationId,
      snapshot.quoteId,
      snapshot.decision,
      snapshot.decisionDate ? new Date(snapshot.decisionDate) : null,
      QuoteNotes.create(snapshot.notes),
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get quoteId(): QuoteId {
    return this._quoteId;
  }
  get status(): ApprovalStatus {
    return this._decision;
  }
  get decision(): ApprovalStatus {
    return this._decision;
  }
  get decisionDate(): Date | null {
    return this._decisionDate ? new Date(this._decisionDate) : null;
  }
  get notes(): QuoteNotes {
    return this._notes;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isPending(): boolean {
    return this._decision === ApprovalStatus.PENDING;
  }
  get isTerminal(): boolean {
    return this._decision !== ApprovalStatus.PENDING;
  }

  accept(now: Date = new Date()): void {
    this.assertPending();
    this._decision = ApprovalStatus.ACCEPTED;
    this._decisionDate = now;
    this._updatedAt = now;
    this.record(
      QuoteApprovalRecorded.create({
        organizationId: this._organizationId,
        approvalId: this.id,
        quoteId: this._quoteId,
        decision: ApprovalStatus.ACCEPTED,
        occurredAt: now,
      }),
    );
  }

  decline(now: Date = new Date()): void {
    this.assertPending();
    this._decision = ApprovalStatus.DECLINED;
    this._decisionDate = now;
    this._updatedAt = now;
    this.record(
      QuoteApprovalRecorded.create({
        organizationId: this._organizationId,
        approvalId: this.id,
        quoteId: this._quoteId,
        decision: ApprovalStatus.DECLINED,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): QuoteApprovalSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      quoteId: this._quoteId,
      decision: this._decision,
      decisionDate: this.decisionDate,
      notes: this._notes.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertPending(): void {
    if (this._decision !== ApprovalStatus.PENDING) {
      throw new QuoteApprovalError(
        "Approval decision is terminal and immutable.",
      );
    }
  }
}
