import { AggregateRoot, generateId } from "@creative-lab/core";
import type { OrganizationId } from "@creative-lab/organization";
import { InvalidAllocationStateError } from "../../errors/AllocationErrors.js";
import {
  AllocationGroupArchived,
  AllocationGroupCreated,
} from "../../events/allocation-events.js";
import {
  asAllocationGroupId,
  type AllocationGroupId,
  type AllocationId,
} from "../../types/ids.js";
import { AllocationName } from "../../value-objects/AllocationName.js";
import { AllocationNotes } from "../../value-objects/AllocationNotes.js";

export type CreateAllocationGroupProps = {
  organizationId: OrganizationId;
  name: string;
  description?: string | null;
  allocationIds?: readonly AllocationId[];
  id?: string;
  now?: Date;
};

export type AllocationGroupSnapshot = {
  id: AllocationGroupId;
  organizationId: OrganizationId;
  name: string;
  description: string | null;
  allocationIds: string[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Logical grouping of allocation commitments (e.g. Album Production).
 */
export class AllocationGroup extends AggregateRoot<AllocationGroupId> {
  private constructor(
    id: AllocationGroupId,
    private readonly _organizationId: OrganizationId,
    private _name: AllocationName,
    private _description: AllocationNotes,
    private _allocationIds: AllocationId[],
    private _archived: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  static create(props: CreateAllocationGroupProps): AllocationGroup {
    const now = props.now ?? new Date();
    const id = asAllocationGroupId(props.id ?? generateId());
    const ids = uniqueIds(props.allocationIds ?? []);
    const group = new AllocationGroup(
      id,
      props.organizationId,
      AllocationName.create(props.name),
      AllocationNotes.create(props.description),
      ids,
      false,
      now,
      now,
    );
    group.record(
      AllocationGroupCreated.create({
        organizationId: props.organizationId,
        groupId: id,
        name: group._name.value,
        occurredAt: now,
      }),
    );
    return group;
  }

  static reconstitute(snapshot: AllocationGroupSnapshot): AllocationGroup {
    return new AllocationGroup(
      snapshot.id,
      snapshot.organizationId,
      AllocationName.create(snapshot.name),
      AllocationNotes.create(snapshot.description),
      snapshot.allocationIds as AllocationId[],
      snapshot.archived,
      new Date(snapshot.createdAt),
      new Date(snapshot.updatedAt),
    );
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }
  get name(): AllocationName {
    return this._name;
  }
  get description(): AllocationNotes {
    return this._description;
  }
  get allocationIds(): readonly AllocationId[] {
    return [...this._allocationIds];
  }
  get archived(): boolean {
    return this._archived;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  rename(name: string, now: Date = new Date()): void {
    this.assertMutable();
    this._name = AllocationName.create(name);
    this._updatedAt = now;
  }

  addAllocation(allocationId: AllocationId, now: Date = new Date()): void {
    this.assertMutable();
    if (!allocationId) {
      throw new InvalidAllocationStateError("Allocation id is required.");
    }
    if (this._allocationIds.includes(allocationId)) return;
    this._allocationIds = [...this._allocationIds, allocationId];
    this._updatedAt = now;
  }

  removeAllocation(allocationId: AllocationId, now: Date = new Date()): void {
    this.assertMutable();
    this._allocationIds = this._allocationIds.filter(
      (id) => id !== allocationId,
    );
    this._updatedAt = now;
  }

  archive(now: Date = new Date()): void {
    this.assertMutable();
    this._archived = true;
    this._updatedAt = now;
    this.record(
      AllocationGroupArchived.create({
        organizationId: this._organizationId,
        groupId: this.id,
        occurredAt: now,
      }),
    );
  }

  contains(allocationId: AllocationId): boolean {
    return this._allocationIds.includes(allocationId);
  }

  toSnapshot(): AllocationGroupSnapshot {
    return {
      id: this.id,
      organizationId: this._organizationId,
      name: this._name.value,
      description: this._description.value,
      allocationIds: this._allocationIds.map(String),
      archived: this._archived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertMutable(): void {
    if (this._archived) {
      throw new InvalidAllocationStateError(
        "Archived allocation groups are immutable.",
      );
    }
  }
}

function uniqueIds(ids: readonly AllocationId[]): AllocationId[] {
  const seen = new Set<string>();
  const out: AllocationId[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
