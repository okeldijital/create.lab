import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { ContractTermError } from "../../errors/ContractErrors.js";
import { ContractTermAdded } from "../../events/contract-events.js";
import {
  asContractTermId,
  type ContractTermId,
  type ContractVersionId,
} from "../../types/ids.js";
import { TermDescription } from "../../value-objects/TermDescription.js";
import { TermTitle } from "../../value-objects/TermTitle.js";

export type CreateContractTermProps = {
  organizationId: OrganizationId;
  contractVersionId: ContractVersionId;
  title: string;
  description: string;
  mandatory?: boolean;
  order: number;
  id?: string;
  now?: Date;
};

export type ContractTermSnapshot = {
  id: ContractTermId;
  organizationId: OrganizationId;
  contractVersionId: ContractVersionId;
  title: string;
  description: string;
  mandatory: boolean;
  order: number;
  createdAt: Date;
};

/**
 * One contractual clause. Immutable after version lock/activation.
 */
export class ContractTerm extends AggregateRoot<ContractTermId> {
  private constructor(
    id: ContractTermId,
    private readonly _organizationId: OrganizationId,
    private readonly _contractVersionId: ContractVersionId,
    private readonly _title: TermTitle,
    private readonly _description: TermDescription,
    private readonly _mandatory: boolean,
    private _order: number,
    private readonly _createdAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateContractTermProps): ContractTerm {
    if (!props.contractVersionId) {
      throw new ContractTermError("Term requires a contract version.");
    }
    if (!Number.isInteger(props.order) || props.order < 1) {
      throw new ContractTermError("Term order must be a positive integer.");
    }
    const now = props.now ?? new Date();
    const id = asContractTermId(props.id ?? generateId());
    const term = new ContractTerm(
      id,
      props.organizationId,
      props.contractVersionId,
      TermTitle.create(props.title),
      TermDescription.create(props.description),
      props.mandatory === true,
      props.order,
      now,
    );
    term.record(
      ContractTermAdded.create({
        organizationId: props.organizationId,
        termId: id,
        versionId: props.contractVersionId,
        title: term.title.value,
        order: term.order,
        occurredAt: now,
      }),
    );
    return term;
  }

  static reconstitute(snapshot: ContractTermSnapshot): ContractTerm {
    return new ContractTerm(
      snapshot.id,
      snapshot.organizationId,
      snapshot.contractVersionId,
      TermTitle.create(snapshot.title),
      TermDescription.create(snapshot.description),
      snapshot.mandatory,
      snapshot.order,
      new Date(snapshot.createdAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get contractVersionId(): ContractVersionId {
    return this._contractVersionId;
  }
  get title(): TermTitle {
    return this._title;
  }
  get description(): TermDescription {
    return this._description;
  }
  get mandatory(): boolean {
    return this._mandatory;
  }
  get order(): number {
    return this._order;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  setOrder(order: number): void {
    if (!Number.isInteger(order) || order < 1) {
      throw new ContractTermError("Term order must be a positive integer.");
    }
    this._order = order;
  }

  toSnapshot(): ContractTermSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      contractVersionId: this._contractVersionId,
      title: this._title.value,
      description: this._description.value,
      mandatory: this._mandatory,
      order: this._order,
      createdAt: this.createdAt,
    };
  }
}
