import type { OrganizationId } from "@creative-lab/organization";
import { Employment } from "../aggregates/Employment/Employment.js";
import type { CreateEmploymentProps } from "../aggregates/Employment/Employment.js";
import type { EmploymentStatus } from "../enums/EmploymentStatus.js";
import {
  EmploymentNotFoundError,
  WorkerNotFoundError,
} from "../errors/WorkforceErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { EmploymentLifecyclePolicy } from "../policies/EmploymentLifecyclePolicy.js";
import type { EmploymentRepository } from "../repositories/EmploymentRepository.js";
import type { WorkerRepository } from "../repositories/WorkerRepository.js";
import type { EmploymentId, WorkerId } from "../types/ids.js";

export type EmploymentServiceDeps = {
  employmentRepository: EmploymentRepository;
  workerRepository: WorkerRepository;
  eventPublisher: DomainEventPublisher;
};

export class EmploymentService {
  constructor(private readonly deps: EmploymentServiceDeps) {}

  async start(props: CreateEmploymentProps): Promise<Employment> {
    const worker = await this.deps.workerRepository.findById(props.workerId);
    if (!worker) throw new WorkerNotFoundError(props.workerId);
    if (worker.organizationId !== props.organizationId) {
      throw new EmploymentNotFoundError(
        "Worker organization mismatch for employment.",
      );
    }
    EmploymentLifecyclePolicy.assertCanStartEmployment(worker);

    const active = await this.deps.employmentRepository.findActiveByWorker(
      props.workerId,
    );
    EmploymentLifecyclePolicy.assertNoActiveEmployment(active);

    const employment = Employment.create(props);
    await this.deps.employmentRepository.save(employment);
    await this.deps.eventPublisher.publish(employment.pullDomainEvents());
    return employment;
  }

  async getById(id: EmploymentId): Promise<Employment> {
    const employment = await this.deps.employmentRepository.findById(id);
    if (!employment) throw new EmploymentNotFoundError(id);
    return employment;
  }

  async listByWorker(workerId: WorkerId): Promise<Employment[]> {
    return this.deps.employmentRepository.findByWorker(workerId);
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Employment[]> {
    return this.deps.employmentRepository.findByOrganization(organizationId);
  }

  async update(
    id: EmploymentId,
    props: {
      employmentType?: CreateEmploymentProps["employmentType"];
      endDate?: Date | null;
      workingHours?: number;
      noticePeriodDays?: number;
      status?: EmploymentStatus;
      completeProbation?: boolean;
      now?: Date;
    },
  ): Promise<Employment> {
    const employment = await this.getById(id);
    const worker = await this.deps.workerRepository.findById(
      employment.workerId,
    );
    if (!worker) throw new WorkerNotFoundError(employment.workerId);
    EmploymentLifecyclePolicy.assertCanModifyEmployment(worker, employment);

    employment.update(props);
    await this.deps.employmentRepository.update(employment);
    await this.deps.eventPublisher.publish(employment.pullDomainEvents());
    return employment;
  }

  async end(
    id: EmploymentId,
    endDate?: Date,
    status?: EmploymentStatus,
    now?: Date,
  ): Promise<Employment> {
    const employment = await this.getById(id);
    const worker = await this.deps.workerRepository.findById(
      employment.workerId,
    );
    if (!worker) throw new WorkerNotFoundError(employment.workerId);
    EmploymentLifecyclePolicy.assertCanModifyEmployment(worker, employment);

    employment.end(endDate ?? new Date(), status, now);
    await this.deps.employmentRepository.update(employment);
    await this.deps.eventPublisher.publish(employment.pullDomainEvents());
    return employment;
  }
}
