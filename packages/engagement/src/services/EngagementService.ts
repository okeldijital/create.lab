import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  Engagement,
  type CreateEngagementProps,
} from "../aggregates/Engagement/Engagement.js";
import { EngagementStatus } from "../enums/EngagementStatus.js";
import {
  DuplicateEngagementNumberError,
  EngagementNotFoundError,
} from "../errors/EngagementErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { EngagementLifecyclePolicy } from "../policies/EngagementLifecyclePolicy.js";
import type { EngagementRepository } from "../repositories/EngagementRepository.js";
import type { EngagementId } from "../types/ids.js";
import { EngagementNumber } from "../value-objects/EngagementNumber.js";

export type EngagementServiceDeps = {
  engagementRepository: EngagementRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class EngagementService {
  constructor(private readonly deps: EngagementServiceDeps) {}

  async create(props: CreateEngagementProps): Promise<Engagement> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    const eng = Engagement.create(props);
    const existing =
      await this.deps.engagementRepository.findByEngagementNumber(
        props.organizationId,
        eng.engagementNumber.value,
      );
    if (existing) {
      throw new DuplicateEngagementNumberError(
        eng.engagementNumber.value,
        props.organizationId,
      );
    }
    await this.deps.engagementRepository.save(eng);
    await this.deps.eventPublisher.publish(eng.pullDomainEvents());
    return eng;
  }

  async activate(id: EngagementId, now?: Date): Promise<Engagement> {
    const eng = await this.getById(id);
    EngagementLifecyclePolicy.assertCanTransition(
      eng,
      EngagementStatus.ACTIVE,
    );
    eng.activate(now);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish(eng.pullDomainEvents());
    return eng;
  }

  async suspend(id: EngagementId, now?: Date): Promise<Engagement> {
    const eng = await this.getById(id);
    EngagementLifecyclePolicy.assertCanTransition(
      eng,
      EngagementStatus.SUSPENDED,
    );
    eng.suspend(now);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish(eng.pullDomainEvents());
    return eng;
  }

  async resume(id: EngagementId, now?: Date): Promise<Engagement> {
    const eng = await this.getById(id);
    EngagementLifecyclePolicy.assertCanTransition(
      eng,
      EngagementStatus.ACTIVE,
    );
    eng.resume(now);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish(eng.pullDomainEvents());
    return eng;
  }

  async complete(
    id: EngagementId,
    completedDate?: Date,
    now?: Date,
  ): Promise<Engagement> {
    const eng = await this.getById(id);
    EngagementLifecyclePolicy.assertCanTransition(
      eng,
      EngagementStatus.COMPLETED,
    );
    eng.complete(completedDate, now);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish(eng.pullDomainEvents());
    return eng;
  }

  async cancel(id: EngagementId, now?: Date): Promise<Engagement> {
    const eng = await this.getById(id);
    EngagementLifecyclePolicy.assertCanTransition(
      eng,
      EngagementStatus.CANCELLED,
    );
    eng.cancel(now);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish(eng.pullDomainEvents());
    return eng;
  }

  async archive(id: EngagementId, now?: Date): Promise<Engagement> {
    const eng = await this.getById(id);
    EngagementLifecyclePolicy.assertCanTransition(
      eng,
      EngagementStatus.ARCHIVED,
    );
    eng.archive(now);
    await this.deps.engagementRepository.archive(id);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish(eng.pullDomainEvents());
    return eng;
  }

  async getById(id: EngagementId): Promise<Engagement> {
    const eng = await this.deps.engagementRepository.findById(id);
    if (!eng) throw new EngagementNotFoundError(id);
    return eng;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Engagement[]> {
    return this.deps.engagementRepository.findByOrganization(organizationId);
  }

  async findByEngagementNumber(
    organizationId: OrganizationId,
    engagementNumber: string,
  ): Promise<Engagement | null> {
    return this.deps.engagementRepository.findByEngagementNumber(
      organizationId,
      EngagementNumber.create(engagementNumber).value,
    );
  }
}
