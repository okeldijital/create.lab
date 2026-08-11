import {
  Deliverable,
  type CreateDeliverableProps,
} from "../aggregates/Deliverable/Deliverable.js";
import {
  DeliverableNotFoundError,
  EngagementNotFoundError,
} from "../errors/EngagementErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { DeliverablePolicy } from "../policies/DeliverablePolicy.js";
import { EngagementLifecyclePolicy } from "../policies/EngagementLifecyclePolicy.js";
import type { DeliverableRepository } from "../repositories/DeliverableRepository.js";
import type { EngagementRepository } from "../repositories/EngagementRepository.js";
import type { DeliverableId, EngagementId } from "../types/ids.js";

export type DeliverableServiceDeps = {
  deliverableRepository: DeliverableRepository;
  engagementRepository: EngagementRepository;
  eventPublisher: DomainEventPublisher;
};

export type AddDeliverableProps = {
  organizationId: CreateDeliverableProps["organizationId"];
  engagementId: EngagementId;
  title: string;
  description?: string | null;
  sequence?: number;
  now?: Date;
};

export class DeliverableService {
  constructor(private readonly deps: DeliverableServiceDeps) {}

  async create(props: AddDeliverableProps): Promise<Deliverable> {
    const eng = await this.deps.engagementRepository.findById(
      props.engagementId,
    );
    if (!eng) throw new EngagementNotFoundError(props.engagementId);
    EngagementLifecyclePolicy.assertActiveOrDraftStructure(eng);

    const existing = await this.deps.deliverableRepository.findByEngagement(
      props.engagementId,
    );
    const sequence =
      props.sequence ?? DeliverablePolicy.nextSequence(existing);
    DeliverablePolicy.assertUniqueSequence(sequence, existing);

    const deliverable = Deliverable.create({
      organizationId: props.organizationId,
      engagementId: props.engagementId,
      title: props.title,
      description: props.description,
      sequence,
      now: props.now,
    });
    eng.addDeliverableId(deliverable.id, props.now);

    await this.deps.deliverableRepository.save(deliverable);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish([
      ...deliverable.pullDomainEvents(),
      ...eng.pullDomainEvents(),
    ]);
    return deliverable;
  }

  async start(id: DeliverableId, now?: Date): Promise<Deliverable> {
    const d = await this.getById(id);
    const eng = await this.deps.engagementRepository.findById(d.engagementId);
    if (!eng) throw new EngagementNotFoundError(d.engagementId);
    EngagementLifecyclePolicy.assertOperational(eng);
    d.start(now);
    await this.deps.deliverableRepository.update(d);
    await this.deps.eventPublisher.publish(d.pullDomainEvents());
    return d;
  }

  async complete(id: DeliverableId, now?: Date): Promise<Deliverable> {
    const d = await this.getById(id);
    const eng = await this.deps.engagementRepository.findById(d.engagementId);
    if (!eng) throw new EngagementNotFoundError(d.engagementId);
    EngagementLifecyclePolicy.assertOperational(eng);
    d.complete(now);
    await this.deps.deliverableRepository.update(d);
    await this.deps.eventPublisher.publish(d.pullDomainEvents());
    return d;
  }

  async accept(id: DeliverableId, now?: Date): Promise<Deliverable> {
    const d = await this.getById(id);
    const eng = await this.deps.engagementRepository.findById(d.engagementId);
    if (!eng) throw new EngagementNotFoundError(d.engagementId);
    EngagementLifecyclePolicy.assertOperational(eng);
    DeliverablePolicy.assertCanAccept(d);
    d.accept(now);
    await this.deps.deliverableRepository.update(d);
    await this.deps.eventPublisher.publish(d.pullDomainEvents());
    return d;
  }

  async reorder(
    engagementId: EngagementId,
    orderedIds: readonly DeliverableId[],
    now?: Date,
  ): Promise<Deliverable[]> {
    const eng = await this.deps.engagementRepository.findById(engagementId);
    if (!eng) throw new EngagementNotFoundError(engagementId);
    EngagementLifecyclePolicy.assertActiveOrDraftStructure(eng);

    const existing =
      await this.deps.deliverableRepository.findByEngagement(engagementId);
    const byId = new Map(existing.map((d) => [d.id, d]));
    let seq = 1;
    for (const id of orderedIds) {
      const d = byId.get(id);
      if (!d) throw new DeliverableNotFoundError(id);
      d.setSequence(seq, now);
      await this.deps.deliverableRepository.update(d);
      seq += 1;
    }
    return this.listByEngagement(engagementId);
  }

  async getById(id: DeliverableId): Promise<Deliverable> {
    const d = await this.deps.deliverableRepository.findById(id);
    if (!d) throw new DeliverableNotFoundError(id);
    return d;
  }

  async listByEngagement(engagementId: EngagementId): Promise<Deliverable[]> {
    const list =
      await this.deps.deliverableRepository.findByEngagement(engagementId);
    return list.sort((a, b) => a.sequence - b.sequence);
  }
}
