import type { OrganizationId } from "@creative-lab/organization";
import { ContractStatus } from "../../enums/ContractStatus.js";
import type { ContractType } from "../../enums/ContractType.js";
import {
  ContractConflictError,
  InvalidEmploymentPeriodError,
} from "../../errors/WorkforceErrors.js";
import {
  ContractCreated,
  ContractExpired,
} from "../../events/contract-events.js";
import { AggregateRoot } from "@creative-lab/core";
import {
  asEmploymentContractId,
  type EmploymentContractId,
  type EmploymentId,
} from "../../types/ids.js";
import { generateId } from "../../utils/id.js";
import { isBeforeDay, startOfUtcDay } from "../../utils/dates.js";
import { NoticePeriod } from "../../value-objects/NoticePeriod.js";

export type CreateEmploymentContractProps = {
  employmentId: EmploymentId;
  organizationId: OrganizationId;
  contractType: ContractType;
  effectiveDate: Date;
  expiryDate?: Date | null;
  noticePeriodDays?: number;
  id?: string;
  now?: Date;
};

export type EmploymentContractSnapshot = {
  id: EmploymentContractId;
  employmentId: EmploymentId;
  organizationId: OrganizationId;
  contractType: ContractType;
  effectiveDate: Date;
  expiryDate: Date | null;
  noticePeriodDays: number;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class EmploymentContract extends AggregateRoot<EmploymentContractId> {

  private constructor(
    id: EmploymentContractId,
    private readonly _employmentId: EmploymentId,
    private readonly _organizationId: OrganizationId,
    private readonly _contractType: ContractType,
    private readonly _effectiveDate: Date,
    private _expiryDate: Date | null,
    private readonly _noticePeriod: NoticePeriod,
    private _status: ContractStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateEmploymentContractProps): EmploymentContract {
    const effective = startOfUtcDay(props.effectiveDate);
    let expiry: Date | null = null;
    if (props.expiryDate) {
      expiry = startOfUtcDay(props.expiryDate);
      if (isBeforeDay(expiry, effective) || expiry.getTime() === effective.getTime()) {
        throw new InvalidEmploymentPeriodError(
          "Contract expiry date must be after effective date.",
        );
      }
    }
    const noticePeriod = NoticePeriod.create(props.noticePeriodDays ?? 30);
    const now = props.now ?? new Date();
    const id = asEmploymentContractId(props.id ?? generateId());

    const contract = new EmploymentContract(
      id,
      props.employmentId,
      props.organizationId,
      props.contractType,
      effective,
      expiry,
      noticePeriod,
      ContractStatus.ACTIVE,
      now,
      now,
    );

    contract.record(
      ContractCreated.create({
        organizationId: props.organizationId,
        contractId: id,
        employmentId: props.employmentId,
        contractType: props.contractType,
        effectiveDate: effective,
        status: ContractStatus.ACTIVE,
        occurredAt: now,
      }),
    );

    return contract;
  }

  static reconstitute(
    snapshot: EmploymentContractSnapshot,
  ): EmploymentContract {
    return new EmploymentContract(
      snapshot.id,
      snapshot.employmentId,
      snapshot.organizationId,
      snapshot.contractType,
      new Date(snapshot.effectiveDate),
      snapshot.expiryDate ? new Date(snapshot.expiryDate) : null,
      NoticePeriod.create(snapshot.noticePeriodDays),
      snapshot.status,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }
  get employmentId(): EmploymentId {
    return this._employmentId;
  }
  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get contractType(): ContractType {
    return this._contractType;
  }
  get effectiveDate(): Date {
    return new Date(this._effectiveDate);
  }
  get expiryDate(): Date | null {
    return this._expiryDate ? new Date(this._expiryDate) : null;
  }
  get noticePeriod(): NoticePeriod {
    return this._noticePeriod;
  }
  get status(): ContractStatus {
    return this._status;
  }
  get isActive(): boolean {
    return this._status === ContractStatus.ACTIVE;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  expire(at: Date = new Date(), now: Date = new Date()): void {
    if (!this.isActive) {
      throw new ContractConflictError("Contract is not active.");
    }
    this._status = ContractStatus.EXPIRED;
    this._expiryDate = startOfUtcDay(at);
    this._updatedAt = now;
    this.record(
      ContractExpired.create({
        organizationId: this._organizationId,
        contractId: this.id,
        employmentId: this._employmentId,
        expiryDate: this._expiryDate,
        occurredAt: now,
      }),
    );
  }

  terminate(now: Date = new Date()): void {
    if (!this.isActive) {
      throw new ContractConflictError("Contract is not active.");
    }
    this._status = ContractStatus.TERMINATED;
    this._updatedAt = now;
  }

  toSnapshot(): EmploymentContractSnapshot {
    return {
      id: this.id,
      employmentId: this._employmentId,
      organizationId: this._organizationId,
      contractType: this._contractType,
      effectiveDate: new Date(this._effectiveDate),
      expiryDate: this._expiryDate ? new Date(this._expiryDate) : null,
      noticePeriodDays: this._noticePeriod.days,
      status: this._status,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
