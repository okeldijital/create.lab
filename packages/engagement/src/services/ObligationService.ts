import type { ObligationParty } from "../enums/ObligationParty.js";
import {
  Obligation,
  type CreateObligationProps,
} from "../aggregates/Obligation/Obligation.js";
import {
  EngagementNotFoundError,
  ObligationNotFoundError,
} from "../errors/EngagementErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { EngagementLifecyclePolicy } from "../policies/EngagementLifecyclePolicy.js";
import { ObligationPolicy } from "../policies/ObligationPolicy.js";
import type { EngagementRepository } from "../repositories/EngagementRepository.js";
import type { ObligationRepository } from "../repositories/ObligationRepository.js";
import type { EngagementId, ObligationId } from "../types/ids.js";

export type ObligationServiceDeps = {
  obligationRepository: ObligationRepository;
  engagementRepository: EngagementRepository;
  eventPublisher: DomainEventPublisher;
};

export type AddObligationProps = {
  organizationId: CreateObligationProps["organizationId"];
  engagementId: EngagementId;
  party: ObligationParty;
  title: string;
  description?: string | null;
  now?: Date;
};

export class ObligationService {
  constructor(private readonly deps: ObligationServiceDeps) {}

  async create(props: AddObligationProps): Promise<Obligation> {
    const eng = await this.deps.engagementRepository.findById(
      props.engagementId,
    );
    if (!eng) throw new EngagementNotFoundError(props.engagementId);
    EngagementLifecyclePolicy.assertActiveOrDraftStructure(eng);
    ObligationPolicy.assertValidParty(props.party);

    const obligation = Obligation.create({
      organizationId: props.organizationId,
      engagementId: props.engagementId,
      party: props.party,
      title: props.title,
      description: props.description,
      now: props.now,
    });
    eng.addObligationId(obligation.id, props.now);

    await this.deps.obligationRepository.save(obligation);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish([
      ...obligation.pullDomainEvents(),
      ...eng.pullDomainEvents(),
    ]);
    return obligation;
  }

  async fulfill(id: ObligationId, now?: Date): Promise<Obligation> {
    const o = await this.getById(id);
    const eng = await this.deps.engagementRepository.findById(o.engagementId);
    if (!eng) throw new EngagementNotFoundError(o.engagementId);
    EngagementLifecyclePolicy.assertOperational(eng);
    ObligationPolicy.assertCanFulfill(o);
    o.fulfill(now);
    await this.deps.obligationRepository.update(o);
    await this.deps.eventPublisher.publish(o.pullDomainEvents());
    return o;
  }

  async waive(id: ObligationId, now?: Date): Promise<Obligation> {
    const o = await this.getById(id);
    const eng = await this.deps.engagementRepository.findById(o.engagementId);
    if (!eng) throw new EngagementNotFoundError(o.engagementId);
    EngagementLifecyclePolicy.assertOperational(eng);
    ObligationPolicy.assertCanWaive(o);
    o.waive(now);
    await this.deps.obligationRepository.update(o);
    await this.deps.eventPublisher.publish(o.pullDomainEvents());
    return o;
  }

  async getById(id: ObligationId): Promise<Obligation> {
    const o = await this.deps.obligationRepository.findById(id);
    if (!o) throw new ObligationNotFoundError(id);
    return o;
  }

  async listByEngagement(engagementId: EngagementId): Promise<Obligation[]> {
    return this.deps.obligationRepository.findByEngagement(engagementId);
  }
}
