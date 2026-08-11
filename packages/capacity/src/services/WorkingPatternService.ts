import type { OrganizationId, OrganizationRepository } from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import { WorkingPattern } from "../aggregates/WorkingPattern/WorkingPattern.js";
import type { CreateWorkingPatternProps } from "../aggregates/WorkingPattern/WorkingPattern.js";
import { WorkingPatternNotFoundError } from "../errors/CapacityErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { WorkingPatternPolicy } from "../policies/WorkingPatternPolicy.js";
import type { WorkingPatternRepository } from "../repositories/WorkingPatternRepository.js";
import type { WorkingPatternId } from "../types/ids.js";

export type WorkingPatternServiceDeps = {
  workingPatternRepository: WorkingPatternRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class WorkingPatternService {
  constructor(private readonly deps: WorkingPatternServiceDeps) {}

  async create(props: CreateWorkingPatternProps): Promise<WorkingPattern> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const pattern = WorkingPattern.create(props);
    WorkingPatternPolicy.assertConsistentHours(pattern);
    await this.deps.workingPatternRepository.save(pattern);
    await this.deps.eventPublisher.publish(pattern.pullDomainEvents());
    return pattern;
  }

  async getById(id: WorkingPatternId): Promise<WorkingPattern> {
    const pattern = await this.deps.workingPatternRepository.findById(id);
    if (!pattern) throw new WorkingPatternNotFoundError(id);
    return pattern;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<WorkingPattern[]> {
    return this.deps.workingPatternRepository.findByOrganization(
      organizationId,
    );
  }

  async update(
    id: WorkingPatternId,
    props: {
      hoursPerWeek?: number;
      hoursPerDay?: number;
      daysPerWeek?: number;
      overtimeAllowed?: boolean;
      remoteAllowed?: boolean;
      now?: Date;
    },
  ): Promise<WorkingPattern> {
    const pattern = await this.getById(id);
    pattern.update(props);
    WorkingPatternPolicy.assertConsistentHours(pattern);
    await this.deps.workingPatternRepository.update(pattern);
    await this.deps.eventPublisher.publish(pattern.pullDomainEvents());
    return pattern;
  }
}
