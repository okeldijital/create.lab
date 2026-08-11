import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  AllocationGroup,
  type CreateAllocationGroupProps,
} from "../aggregates/AllocationGroup/AllocationGroup.js";
import { AllocationGroupNotFoundError } from "../errors/AllocationErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { AllocationGroupPolicy } from "../policies/AllocationGroupPolicy.js";
import type { AllocationGroupRepository } from "../repositories/AllocationGroupRepository.js";
import type { AllocationGroupId, AllocationId } from "../types/ids.js";

export type AllocationGroupServiceDeps = {
  allocationGroupRepository: AllocationGroupRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class AllocationGroupService {
  constructor(private readonly deps: AllocationGroupServiceDeps) {}

  async create(props: CreateAllocationGroupProps): Promise<AllocationGroup> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const existing =
      await this.deps.allocationGroupRepository.findByOrganization(
        props.organizationId,
      );
    AllocationGroupPolicy.assertUniqueName(
      existing,
      props.name,
      props.organizationId,
    );

    const group = AllocationGroup.create(props);
    await this.deps.allocationGroupRepository.save(group);
    await this.deps.eventPublisher.publish(group.pullDomainEvents());
    return group;
  }

  async rename(
    id: AllocationGroupId,
    name: string,
    now?: Date,
  ): Promise<AllocationGroup> {
    const group = await this.getById(id);
    AllocationGroupPolicy.assertMutable(group);
    const existing =
      await this.deps.allocationGroupRepository.findByOrganization(
        group.organizationId,
      );
    AllocationGroupPolicy.assertUniqueName(
      existing,
      name,
      group.organizationId,
      group.id,
    );
    group.rename(name, now);
    await this.deps.allocationGroupRepository.update(group);
    await this.deps.eventPublisher.publish(group.pullDomainEvents());
    return group;
  }

  async addAllocation(
    id: AllocationGroupId,
    allocationId: AllocationId,
    now?: Date,
  ): Promise<AllocationGroup> {
    const group = await this.getById(id);
    group.addAllocation(allocationId, now);
    await this.deps.allocationGroupRepository.update(group);
    await this.deps.eventPublisher.publish(group.pullDomainEvents());
    return group;
  }

  async removeAllocation(
    id: AllocationGroupId,
    allocationId: AllocationId,
    now?: Date,
  ): Promise<AllocationGroup> {
    const group = await this.getById(id);
    group.removeAllocation(allocationId, now);
    await this.deps.allocationGroupRepository.update(group);
    await this.deps.eventPublisher.publish(group.pullDomainEvents());
    return group;
  }

  async archive(id: AllocationGroupId, now?: Date): Promise<AllocationGroup> {
    const group = await this.getById(id);
    group.archive(now);
    await this.deps.allocationGroupRepository.archive(id);
    await this.deps.allocationGroupRepository.update(group);
    await this.deps.eventPublisher.publish(group.pullDomainEvents());
    return group;
  }

  async getById(id: AllocationGroupId): Promise<AllocationGroup> {
    const group = await this.deps.allocationGroupRepository.findById(id);
    if (!group) throw new AllocationGroupNotFoundError(id);
    return group;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<AllocationGroup[]> {
    return this.deps.allocationGroupRepository.findByOrganization(
      organizationId,
    );
  }
}
