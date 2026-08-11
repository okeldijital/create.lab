import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { AmendmentStatus } from "../../enums/AmendmentStatus.js";
import { ContractAmendmentError } from "../../errors/ContractErrors.js";
import {
  ContractAmendmentApplied,
  ContractAmendmentApproved,
  ContractAmendmentCreated,
} from "../../events/contract-events.js";
import {
  asContractAmendmentId,
  type ContractAmendmentId,
  type ContractId,
  type ContractVersionId,
} from "../../types/ids.js";
import { AmendmentReason } from "../../value-objects/AmendmentReason.js";

export type CreateContractAmendmentProps = {
  organizationId: OrganizationId;
  contractId: ContractId;
  reason: string;
  effectiveDate: Date;
  id?: string;
  now?: Date;
};

export type ContractAmendmentSnapshot = {
  id: ContractAmendmentId;
  organizationId: OrganizationId;
  contractId: ContractId;
  reason: string;
  effectiveDate: Date;
  status: AmendmentStatus;
  resultingVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Contractual amendment. Applied amendments produce a new version and are immutable.
 */
export class ContractAmendment extends AggregateRoot<ContractAmendmentId> {
  private constructor(
    id: ContractAmendmentId,
    private readonly _organizationId: OrganizationId,
    private readonly _contractId: ContractId,
    private readonly _reason: AmendmentReason,
    private readonly _effectiveDate: Date,
    private _status: AmendmentStatus,
    private _resultingVersionId: ContractVersionId | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateContractAmendmentProps): ContractAmendment {
    if (!props.contractId) {
      throw new ContractAmendmentError("Amendment requires a contract.");
    }
    const effectiveDate = new Date(props.effectiveDate);
    if (Number.isNaN(effectiveDate.getTime())) {
      throw new ContractAmendmentError("Invalid amendment effective date.");
    }
    const now = props.now ?? new Date();
    const id = asContractAmendmentId(props.id ?? generateId());
    const amendment = new ContractAmendment(
      id,
      props.organizationId,
      props.contractId,
      AmendmentReason.create(props.reason),
      effectiveDate,
      AmendmentStatus.DRAFT,
      null,
      now,
      now,
    );
    amendment.record(
      ContractAmendmentCreated.create({
        organizationId: props.organizationId,
        amendmentId: id,
        contractId: props.contractId,
        status: AmendmentStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return amendment;
  }

  static reconstitute(
    snapshot: ContractAmendmentSnapshot,
  ): ContractAmendment {
    return new ContractAmendment(
      snapshot.id,
      snapshot.organizationId,
      snapshot.contractId,
      AmendmentReason.create(snapshot.reason),
      new Date(snapshot.effectiveDate),
      snapshot.status,
      (snapshot.resultingVersionId as ContractVersionId | null) ?? null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get contractId(): ContractId {
    return this._contractId;
  }
  get reason(): AmendmentReason {
    return this._reason;
  }
  get effectiveDate(): Date {
    return new Date(this._effectiveDate);
  }
  get status(): AmendmentStatus {
    return this._status;
  }
  get resultingVersionId(): ContractVersionId | null {
    return this._resultingVersionId;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get isApplied(): boolean {
    return this._status === AmendmentStatus.APPLIED;
  }

  approve(now: Date = new Date()): void {
    if (this._status !== AmendmentStatus.DRAFT) {
      throw new ContractAmendmentError(
        `Only DRAFT amendments can be approved (status: ${this._status}).`,
      );
    }
    this._status = AmendmentStatus.APPROVED;
    this._updatedAt = now;
    this.record(
      ContractAmendmentApproved.create({
        organizationId: this._organizationId,
        amendmentId: this.id,
        contractId: this._contractId,
        occurredAt: now,
      }),
    );
  }

  apply(
    newVersionId: ContractVersionId,
    now: Date = new Date(),
  ): void {
    if (this._status !== AmendmentStatus.APPROVED) {
      throw new ContractAmendmentError(
        "Only APPROVED amendments can be applied.",
      );
    }
    this._status = AmendmentStatus.APPLIED;
    this._resultingVersionId = newVersionId;
    this._updatedAt = now;
    this.record(
      ContractAmendmentApplied.create({
        organizationId: this._organizationId,
        amendmentId: this.id,
        contractId: this._contractId,
        newVersionId,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === AmendmentStatus.ARCHIVED) {
      throw new ContractAmendmentError("Amendment already archived.");
    }
    if (this._status === AmendmentStatus.APPLIED) {
      // Applied amendments remain historically immutable but may archive for catalog.
    }
    this._status = AmendmentStatus.ARCHIVED;
    this._updatedAt = now;
  }

  toSnapshot(): ContractAmendmentSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      contractId: this._contractId,
      reason: this._reason.value,
      effectiveDate: this.effectiveDate,
      status: this._status,
      resultingVersionId: this._resultingVersionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
