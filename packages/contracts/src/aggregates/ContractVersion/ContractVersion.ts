import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ContractVersionStatus } from "../../enums/ContractVersionStatus.js";
import { InvalidContractStateError } from "../../errors/ContractErrors.js";
import {
  ContractVersionCreated,
  ContractVersionPromoted,
} from "../../events/contract-events.js";
import {
  asContractVersionId,
  type ContractId,
  type ContractTermId,
  type ContractVersionId,
} from "../../types/ids.js";
import { VersionNumber } from "../../value-objects/VersionNumber.js";

export type CreateContractVersionProps = {
  organizationId: OrganizationId;
  contractId: ContractId;
  versionNumber: number;
  id?: string;
  now?: Date;
};

export type ContractVersionSnapshot = {
  id: ContractVersionId;
  organizationId: OrganizationId;
  contractId: ContractId;
  versionNumber: number;
  termIds: string[];
  status: ContractVersionStatus;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * One revision of a contract. Locked after activation.
 */
export class ContractVersion extends AggregateRoot<ContractVersionId> {
  private constructor(
    id: ContractVersionId,
    private readonly _organizationId: OrganizationId,
    private readonly _contractId: ContractId,
    private readonly _versionNumber: VersionNumber,
    private _termIds: ContractTermId[],
    private _status: ContractVersionStatus,
    private _locked: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateContractVersionProps): ContractVersion {
    if (!props.contractId) {
      throw new InvalidContractStateError("Version requires a contract.");
    }
    const now = props.now ?? new Date();
    const id = asContractVersionId(props.id ?? generateId());
    const version = new ContractVersion(
      id,
      props.organizationId,
      props.contractId,
      VersionNumber.create(props.versionNumber),
      [],
      ContractVersionStatus.CURRENT,
      false,
      now,
      now,
    );
    version.record(
      ContractVersionCreated.create({
        organizationId: props.organizationId,
        versionId: id,
        contractId: props.contractId,
        versionNumber: props.versionNumber,
        occurredAt: now,
      }),
    );
    return version;
  }

  static reconstitute(snapshot: ContractVersionSnapshot): ContractVersion {
    return new ContractVersion(
      snapshot.id,
      snapshot.organizationId,
      snapshot.contractId,
      VersionNumber.create(snapshot.versionNumber),
      snapshot.termIds as ContractTermId[],
      snapshot.status,
      snapshot.locked,
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
  get versionNumber(): number {
    return this._versionNumber.value;
  }
  get termIds(): readonly ContractTermId[] {
    return [...this._termIds];
  }
  get status(): ContractVersionStatus {
    return this._status;
  }
  get locked(): boolean {
    return this._locked;
  }
  get isCurrent(): boolean {
    return this._status === ContractVersionStatus.CURRENT;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  setTermIds(termIds: readonly ContractTermId[], now: Date = new Date()): void {
    this.assertEditable();
    this._termIds = [...termIds];
    this._updatedAt = now;
  }

  addTermId(termId: ContractTermId, now: Date = new Date()): void {
    this.assertEditable();
    if (!this._termIds.includes(termId)) {
      this._termIds = [...this._termIds, termId];
      this._updatedAt = now;
    }
  }

  removeTermId(termId: ContractTermId, now: Date = new Date()): void {
    this.assertEditable();
    this._termIds = this._termIds.filter((id) => id !== termId);
    this._updatedAt = now;
  }

  lock(now: Date = new Date()): void {
    this._locked = true;
    this._updatedAt = now;
  }

  supersede(now: Date = new Date()): void {
    this._status = ContractVersionStatus.SUPERSEDED;
    this._locked = true;
    this._updatedAt = now;
  }

  promote(
    previousVersionId: ContractVersionId | null,
    now: Date = new Date(),
  ): void {
    this._status = ContractVersionStatus.CURRENT;
    this._updatedAt = now;
    this.record(
      ContractVersionPromoted.create({
        organizationId: this._organizationId,
        versionId: this.id,
        contractId: this._contractId,
        previousVersionId,
        occurredAt: now,
      }),
    );
  }

  toSnapshot(): ContractVersionSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      contractId: this._contractId,
      versionNumber: this._versionNumber.value,
      termIds: this._termIds.map(String),
      status: this._status,
      locked: this._locked,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertEditable(): void {
    if (this._locked) {
      throw new InvalidContractStateError(
        "Locked contract versions are immutable.",
      );
    }
    if (this._status === ContractVersionStatus.SUPERSEDED) {
      throw new InvalidContractStateError(
        "Superseded versions cannot be edited.",
      );
    }
  }
}
