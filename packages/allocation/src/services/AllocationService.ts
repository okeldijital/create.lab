import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import type { WorkOrderId } from "@creative-lab/operations";
import type { ProjectId } from "@creative-lab/projects";
import {
  Allocation,
  type CreateAllocationProps,
} from "../aggregates/Allocation/Allocation.js";
import { AllocationNotFoundError } from "../errors/AllocationErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import {
  AllocationConflictPolicy,
  AllocationPolicy,
} from "../policies/index.js";
import type { AllocationRepository } from "../repositories/AllocationRepository.js";
import type { AllocationId } from "../types/ids.js";

export type AllocationServiceDeps = {
  allocationRepository: AllocationRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class AllocationService {
  constructor(private readonly deps: AllocationServiceDeps) {}

  async create(props: CreateAllocationProps): Promise<Allocation> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }

    AllocationPolicy.assertPercentage(props.allocationPercentage);
    AllocationPolicy.assertDateOrder(props.startDate, props.endDate);

    const byResource = await this.deps.allocationRepository.findByResource(
      String(props.resourceId),
    );
    AllocationConflictPolicy.detectConflicts({
      existing: byResource,
      resourceId: String(props.resourceId),
      workOrderId: props.workOrderId,
      start: new Date(props.startDate),
      end: new Date(props.endDate),
    });

    const allocation = Allocation.create(props);
    await this.deps.allocationRepository.save(allocation);
    await this.deps.eventPublisher.publish(allocation.pullDomainEvents());
    return allocation;
  }

  async update(
    id: AllocationId,
    props: {
      allocationPercentage?: number;
      startDate?: Date;
      endDate?: Date;
      priority?: CreateAllocationProps["priority"];
      notes?: string | null;
      now?: Date;
    },
  ): Promise<Allocation> {
    const allocation = await this.getById(id);
    AllocationPolicy.assertMutable(allocation);

    const start = props.startDate ?? allocation.startDate;
    const end = props.endDate ?? allocation.endDate;
    if (props.allocationPercentage !== undefined) {
      AllocationPolicy.assertPercentage(props.allocationPercentage);
    }
    AllocationPolicy.assertDateOrder(start, end);

    const byResource = await this.deps.allocationRepository.findByResource(
      allocation.resourceId,
    );
    AllocationConflictPolicy.detectConflicts({
      existing: byResource,
      resourceId: allocation.resourceId,
      workOrderId: allocation.workOrderId,
      start: new Date(start),
      end: new Date(end),
      excludeId: allocation.id,
    });

    allocation.update(props);
    await this.deps.allocationRepository.update(allocation);
    await this.deps.eventPublisher.publish(allocation.pullDomainEvents());
    return allocation;
  }

  async activate(id: AllocationId, now?: Date): Promise<Allocation> {
    const allocation = await this.getById(id);
    AllocationPolicy.assertMutable(allocation);
    allocation.activate(now);
    await this.deps.allocationRepository.update(allocation);
    await this.deps.eventPublisher.publish(allocation.pullDomainEvents());
    return allocation;
  }

  async complete(id: AllocationId, now?: Date): Promise<Allocation> {
    const allocation = await this.getById(id);
    AllocationPolicy.assertMutable(allocation);
    allocation.complete(now);
    await this.deps.allocationRepository.update(allocation);
    await this.deps.eventPublisher.publish(allocation.pullDomainEvents());
    return allocation;
  }

  async cancel(id: AllocationId, now?: Date): Promise<Allocation> {
    const allocation = await this.getById(id);
    AllocationPolicy.assertMutable(allocation);
    allocation.cancel(now);
    await this.deps.allocationRepository.update(allocation);
    await this.deps.eventPublisher.publish(allocation.pullDomainEvents());
    return allocation;
  }

  async archive(id: AllocationId, now?: Date): Promise<Allocation> {
    const allocation = await this.getById(id);
    AllocationPolicy.assertMutable(allocation);
    allocation.archive(now);
    await this.deps.allocationRepository.archive(id);
    await this.deps.allocationRepository.update(allocation);
    await this.deps.eventPublisher.publish(allocation.pullDomainEvents());
    return allocation;
  }

  async getById(id: AllocationId): Promise<Allocation> {
    const allocation = await this.deps.allocationRepository.findById(id);
    if (!allocation) throw new AllocationNotFoundError(id);
    return allocation;
  }

  async listByProject(projectId: ProjectId): Promise<Allocation[]> {
    return this.deps.allocationRepository.findByProject(projectId);
  }

  async listByWorkOrder(workOrderId: WorkOrderId): Promise<Allocation[]> {
    return this.deps.allocationRepository.findByWorkOrder(workOrderId);
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Allocation[]> {
    return this.deps.allocationRepository.findByOrganization(organizationId);
  }
}
