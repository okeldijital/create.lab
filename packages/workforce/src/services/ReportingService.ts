import type { OrganizationId } from "@creative-lab/organization";
import { ReportingRelationship } from "../aggregates/ReportingRelationship/ReportingRelationship.js";
import {
  WorkerNotFoundError,
} from "../errors/WorkforceErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ReportingHierarchyPolicy } from "../policies/ReportingHierarchyPolicy.js";
import { WorkerAssignmentPolicy } from "../policies/WorkerAssignmentPolicy.js";
import type { ReportingRelationshipRepository } from "../repositories/ReportingRelationshipRepository.js";
import type { WorkerRepository } from "../repositories/WorkerRepository.js";
import type { ReportingRelationshipId, WorkerId } from "../types/ids.js";

export type ReportingServiceDeps = {
  reportingRepository: ReportingRelationshipRepository;
  workerRepository: WorkerRepository;
  eventPublisher: DomainEventPublisher;
};

export class ReportingService {
  constructor(private readonly deps: ReportingServiceDeps) {}

  async assignManager(input: {
    organizationId: OrganizationId;
    workerId: WorkerId;
    managerId: WorkerId;
    effectiveDate?: Date;
    now?: Date;
  }): Promise<ReportingRelationship> {
    const worker = await this.deps.workerRepository.findById(input.workerId);
    if (!worker) throw new WorkerNotFoundError(input.workerId);
    const manager = await this.deps.workerRepository.findById(input.managerId);
    if (!manager) throw new WorkerNotFoundError(input.managerId);

    WorkerAssignmentPolicy.assertManagerInOrganization(
      manager,
      input.organizationId,
      input.workerId,
    );
    if (worker.organizationId !== input.organizationId) {
      throw new WorkerNotFoundError(input.workerId);
    }

    const peers = await this.deps.workerRepository.findByOrganization(
      input.organizationId,
    );
    ReportingHierarchyPolicy.assertValidAssignment({
      workerId: input.workerId,
      managerId: input.managerId,
      organizationId: input.organizationId,
      nodes: peers.map((w) => ({
        workerId: w.id,
        managerId:
          w.id === input.workerId ? input.managerId : w.managerId,
        organizationId: w.organizationId,
      })),
    });

    const previous = await this.deps.reportingRepository.findActiveByWorker(
      input.workerId,
    );
    const previousManagerId = previous?.managerId ?? worker.managerId;
    if (previous) {
      previous.end(input.effectiveDate ?? input.now ?? new Date(), input.now);
      await this.deps.reportingRepository.update(previous);
      await this.deps.eventPublisher.publish(previous.pullDomainEvents());
    }

    const relationship = ReportingRelationship.create({
      organizationId: input.organizationId,
      workerId: input.workerId,
      managerId: input.managerId,
      effectiveDate: input.effectiveDate,
      previousManagerId:
        previousManagerId !== input.managerId ? previousManagerId : undefined,
      now: input.now,
    });

    worker.assignManager(input.managerId, input.now);
    await this.deps.workerRepository.update(worker);
    await this.deps.reportingRepository.save(relationship);

    await this.deps.eventPublisher.publish([
      ...worker.pullDomainEvents(),
      ...relationship.pullDomainEvents(),
    ]);

    return relationship;
  }

  async endRelationship(
    id: ReportingRelationshipId,
    endDate?: Date,
    now?: Date,
  ): Promise<ReportingRelationship> {
    const relationship = await this.deps.reportingRepository.findById(id);
    if (!relationship) {
      throw new WorkerNotFoundError(`relationship ${id}`);
    }
    relationship.end(endDate, now);
    await this.deps.reportingRepository.update(relationship);

    const worker = await this.deps.workerRepository.findById(
      relationship.workerId,
    );
    if (worker && worker.managerId === relationship.managerId) {
      worker.assignManager(null, now);
      await this.deps.workerRepository.update(worker);
      await this.deps.eventPublisher.publish([
        ...worker.pullDomainEvents(),
        ...relationship.pullDomainEvents(),
      ]);
    } else {
      await this.deps.eventPublisher.publish(relationship.pullDomainEvents());
    }

    return relationship;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<ReportingRelationship[]> {
    return this.deps.reportingRepository.findByOrganization(organizationId);
  }
}
