import {
  Milestone,
  type CreateMilestoneProps,
} from "../aggregates/Milestone/Milestone.js";
import {
  EngagementNotFoundError,
  MilestoneNotFoundError,
} from "../errors/EngagementErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { EngagementLifecyclePolicy } from "../policies/EngagementLifecyclePolicy.js";
import { MilestonePolicy } from "../policies/MilestonePolicy.js";
import type { EngagementRepository } from "../repositories/EngagementRepository.js";
import type { MilestoneRepository } from "../repositories/MilestoneRepository.js";
import type { EngagementId, MilestoneId } from "../types/ids.js";

export type MilestoneServiceDeps = {
  milestoneRepository: MilestoneRepository;
  engagementRepository: EngagementRepository;
  eventPublisher: DomainEventPublisher;
};

export type AddMilestoneProps = {
  organizationId: CreateMilestoneProps["organizationId"];
  engagementId: EngagementId;
  title: string;
  targetDate: Date;
  sequence?: number;
  now?: Date;
};

export class MilestoneService {
  constructor(private readonly deps: MilestoneServiceDeps) {}

  async create(props: AddMilestoneProps): Promise<Milestone> {
    const eng = await this.deps.engagementRepository.findById(
      props.engagementId,
    );
    if (!eng) throw new EngagementNotFoundError(props.engagementId);
    EngagementLifecyclePolicy.assertActiveOrDraftStructure(eng);

    const existing = await this.deps.milestoneRepository.findByEngagement(
      props.engagementId,
    );
    const sequence =
      props.sequence ?? MilestonePolicy.nextSequence(existing);
    MilestonePolicy.assertUniqueSequence(sequence, existing);
    MilestonePolicy.assertChronological(
      sequence,
      props.targetDate,
      existing,
    );

    const milestone = Milestone.create({
      organizationId: props.organizationId,
      engagementId: props.engagementId,
      title: props.title,
      targetDate: props.targetDate,
      sequence,
      now: props.now,
    });
    eng.addMilestoneId(milestone.id, props.now);

    await this.deps.milestoneRepository.save(milestone);
    await this.deps.engagementRepository.update(eng);
    await this.deps.eventPublisher.publish([
      ...milestone.pullDomainEvents(),
      ...eng.pullDomainEvents(),
    ]);
    return milestone;
  }

  async activate(id: MilestoneId, now?: Date): Promise<Milestone> {
    const m = await this.getById(id);
    const eng = await this.deps.engagementRepository.findById(m.engagementId);
    if (!eng) throw new EngagementNotFoundError(m.engagementId);
    EngagementLifecyclePolicy.assertOperational(eng);

    const existing = await this.deps.milestoneRepository.findByEngagement(
      m.engagementId,
    );
    MilestonePolicy.assertOneActive(existing, m.id);
    m.activate(now);
    await this.deps.milestoneRepository.update(m);
    await this.deps.eventPublisher.publish(m.pullDomainEvents());
    return m;
  }

  async complete(id: MilestoneId, now?: Date): Promise<Milestone> {
    const m = await this.getById(id);
    const eng = await this.deps.engagementRepository.findById(m.engagementId);
    if (!eng) throw new EngagementNotFoundError(m.engagementId);
    EngagementLifecyclePolicy.assertOperational(eng);
    m.complete(now);
    await this.deps.milestoneRepository.update(m);
    await this.deps.eventPublisher.publish(m.pullDomainEvents());
    return m;
  }

  async getById(id: MilestoneId): Promise<Milestone> {
    const m = await this.deps.milestoneRepository.findById(id);
    if (!m) throw new MilestoneNotFoundError(id);
    return m;
  }

  async listByEngagement(engagementId: EngagementId): Promise<Milestone[]> {
    const list =
      await this.deps.milestoneRepository.findByEngagement(engagementId);
    return list.sort((a, b) => a.sequence - b.sequence);
  }
}
