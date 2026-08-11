import { AggregateRoot, generateId } from "@creative-lab/core";
import type { CustomerId } from "@creative-lab/crm";
import type { OrganizationId } from "@creative-lab/organization";
import type { QuoteId } from "@creative-lab/quotation";
import {
  ContractStatus,
  canTransitionContract,
} from "../../enums/ContractStatus.js";
import {
  ContractAlreadyActiveError,
  InvalidContractStateError,
} from "../../errors/ContractErrors.js";
import {
  ContractActivated,
  ContractArchived,
  ContractCreated,
  ContractExpired,
  ContractTerminated,
} from "../../events/contract-events.js";
import {
  asContractId,
  type ContractId,
  type ContractVersionId,
} from "../../types/ids.js";
import { ContractNumber } from "../../value-objects/ContractNumber.js";
import { EffectivePeriod } from "../../value-objects/EffectivePeriod.js";

export type CreateContractProps = {
  organizationId: OrganizationId;
  customerId: CustomerId;
  quotationId: QuoteId;
  contractNumber?: string;
  effectiveDate: Date;
  expiryDate?: Date | null;
  id?: string;
  now?: Date;
};

export type ContractSnapshot = {
  id: ContractId;
  organizationId: OrganizationId;
  contractNumber: string;
  customerId: CustomerId;
  quotationId: QuoteId;
  status: ContractStatus;
  effectiveDate: Date;
  expiryDate: Date | null;
  currentVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

/**
 * Legally binding agreement. Number/customer/quotation immutable.
 */
export class Contract extends AggregateRoot<ContractId> {
  private constructor(
    id: ContractId,
    private readonly _organizationId: OrganizationId,
    private readonly _contractNumber: ContractNumber,
    private readonly _customerId: CustomerId,
    private readonly _quotationId: QuoteId,
    private _status: ContractStatus,
    private _period: EffectivePeriod,
    private _currentVersionId: ContractVersionId | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null,
  ) {
    super(id);
  }

  static create(props: CreateContractProps): Contract {
    if (!props.organizationId) {
      throw new InvalidContractStateError("Contract requires an organization.");
    }
    if (!props.customerId) {
      throw new InvalidContractStateError("Contract requires a customer.");
    }
    if (!props.quotationId) {
      throw new InvalidContractStateError("Contract requires a quotation.");
    }
    const now = props.now ?? new Date();
    const id = asContractId(props.id ?? generateId());
    const number = props.contractNumber
      ? ContractNumber.create(props.contractNumber)
      : ContractNumber.generate(now);
    const period = EffectivePeriod.create(
      props.effectiveDate,
      props.expiryDate,
    );
    const contract = new Contract(
      id,
      props.organizationId,
      number,
      props.customerId,
      props.quotationId,
      ContractStatus.DRAFT,
      period,
      null,
      now,
      now,
      null,
    );
    contract.record(
      ContractCreated.create({
        organizationId: props.organizationId,
        contractId: id,
        contractNumber: number.value,
        customerId: props.customerId,
        quotationId: props.quotationId,
        status: ContractStatus.DRAFT,
        occurredAt: now,
      }),
    );
    return contract;
  }

  static reconstitute(snapshot: ContractSnapshot): Contract {
    return new Contract(
      snapshot.id,
      snapshot.organizationId,
      ContractNumber.create(snapshot.contractNumber),
      snapshot.customerId,
      snapshot.quotationId,
      snapshot.status,
      EffectivePeriod.create(snapshot.effectiveDate, snapshot.expiryDate),
      (snapshot.currentVersionId as ContractVersionId | null) ?? null,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
      snapshot.archivedAt ? new Date(snapshot.archivedAt) : null,
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get contractNumber(): ContractNumber {
    return this._contractNumber;
  }
  get customerId(): CustomerId {
    return this._customerId;
  }
  get quotationId(): QuoteId {
    return this._quotationId;
  }
  get status(): ContractStatus {
    return this._status;
  }
  get effectiveDate(): Date {
    return this._period.effectiveDate;
  }
  get expiryDate(): Date | null {
    return this._period.expiryDate;
  }
  get currentVersionId(): ContractVersionId | null {
    return this._currentVersionId;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }
  get archivedAt(): Date | null {
    return this._archivedAt ? new Date(this._archivedAt) : null;
  }
  get isDraft(): boolean {
    return this._status === ContractStatus.DRAFT;
  }
  get isActive(): boolean {
    return this._status === ContractStatus.ACTIVE;
  }
  get isArchived(): boolean {
    return this._status === ContractStatus.ARCHIVED;
  }

  isPastExpiry(now: Date = new Date()): boolean {
    return this._period.isExpired(now);
  }

  setCurrentVersion(
    versionId: ContractVersionId,
    now: Date = new Date(),
  ): void {
    this.assertMutable();
    this._currentVersionId = versionId;
    this._updatedAt = now;
  }

  markPendingSignature(now: Date = new Date()): void {
    this.transitionTo(ContractStatus.PENDING_SIGNATURE, now);
  }

  activate(now: Date = new Date()): void {
    this.assertMutable();
    if (this._status === ContractStatus.ACTIVE) {
      throw new ContractAlreadyActiveError(this.id);
    }
    if (!this._currentVersionId) {
      throw new InvalidContractStateError(
        "Cannot activate contract without a current version.",
      );
    }
    this.transitionTo(ContractStatus.ACTIVE, now);
    this.record(
      ContractActivated.create({
        organizationId: this._organizationId,
        contractId: this.id,
        occurredAt: now,
      }),
    );
  }

  expire(now: Date = new Date()): void {
    this.transitionTo(ContractStatus.EXPIRED, now);
    this.record(
      ContractExpired.create({
        organizationId: this._organizationId,
        contractId: this.id,
        occurredAt: now,
      }),
    );
  }

  terminate(now: Date = new Date()): void {
    this.transitionTo(ContractStatus.TERMINATED, now);
    this.record(
      ContractTerminated.create({
        organizationId: this._organizationId,
        contractId: this.id,
        occurredAt: now,
      }),
    );
  }

  archive(now: Date = new Date()): void {
    if (this._status === ContractStatus.ARCHIVED) {
      throw new InvalidContractStateError("Contract already archived.");
    }
    this.transitionTo(ContractStatus.ARCHIVED, now);
    this._archivedAt = now;
    this.record(
      ContractArchived.create({
        organizationId: this._organizationId,
        contractId: this.id,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ContractSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      contractNumber: this._contractNumber.value,
      customerId: this._customerId,
      quotationId: this._quotationId,
      status: this._status,
      effectiveDate: this.effectiveDate,
      expiryDate: this.expiryDate,
      currentVersionId: this._currentVersionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
    };
  }

  private transitionTo(to: ContractStatus, now: Date): void {
    this.assertMutable();
    if (!canTransitionContract(this._status, to)) {
      throw new InvalidContractStateError(
        `Cannot transition contract from ${this._status} to ${to}.`,
      );
    }
    if (this._status === to) return;
    this._status = to;
    this._updatedAt = now;
  }

  private assertMutable(): void {
    if (this._status === ContractStatus.ARCHIVED) {
      throw new InvalidContractStateError(
        "Archived contracts are immutable.",
      );
    }
  }
}
