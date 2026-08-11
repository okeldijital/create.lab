import {
  Opportunity,
  type CreateOpportunityProps,
} from "../aggregates/Opportunity/Opportunity.js";
import { OpportunityStatus } from "../enums/OpportunityStatus.js";
import {
  CustomerNotFoundError,
  OpportunityNotFoundError,
} from "../errors/CRMErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { CustomerLifecyclePolicy } from "../policies/CustomerLifecyclePolicy.js";
import { OpportunityPolicy } from "../policies/OpportunityPolicy.js";
import type { CustomerRepository } from "../repositories/CustomerRepository.js";
import type { OpportunityRepository } from "../repositories/OpportunityRepository.js";
import type { CustomerId, OpportunityId } from "../types/ids.js";

export type OpportunityServiceDeps = {
  opportunityRepository: OpportunityRepository;
  customerRepository: CustomerRepository;
  eventPublisher: DomainEventPublisher;
};

export class OpportunityService {
  constructor(private readonly deps: OpportunityServiceDeps) {}

  async create(props: CreateOpportunityProps): Promise<Opportunity> {
    const customer = await this.deps.customerRepository.findById(
      props.customerId,
    );
    if (!customer) throw new CustomerNotFoundError(props.customerId);
    CustomerLifecyclePolicy.assertMutable(customer);

    OpportunityPolicy.assertValidValue(props.estimatedValueMinor ?? 0);
    OpportunityPolicy.assertValidProbability(props.probability ?? 0);

    const opportunity = Opportunity.create(props);
    await this.deps.opportunityRepository.save(opportunity);
    await this.deps.eventPublisher.publish(opportunity.pullDomainEvents());
    return opportunity;
  }

  async qualify(id: OpportunityId, now?: Date): Promise<Opportunity> {
    return this.progress(id, OpportunityStatus.QUALIFIED, (o) =>
      o.qualify(now),
    );
  }

  async propose(id: OpportunityId, now?: Date): Promise<Opportunity> {
    return this.progress(id, OpportunityStatus.PROPOSAL, (o) =>
      o.propose(now),
    );
  }

  async negotiate(id: OpportunityId, now?: Date): Promise<Opportunity> {
    return this.progress(id, OpportunityStatus.NEGOTIATION, (o) =>
      o.negotiate(now),
    );
  }

  async win(id: OpportunityId, now?: Date): Promise<Opportunity> {
    const opportunity = await this.getById(id);
    OpportunityPolicy.assertCanWin(opportunity);
    opportunity.win(now);
    await this.deps.opportunityRepository.update(opportunity);
    await this.deps.eventPublisher.publish(opportunity.pullDomainEvents());
    return opportunity;
  }

  async lose(id: OpportunityId, now?: Date): Promise<Opportunity> {
    const opportunity = await this.getById(id);
    OpportunityPolicy.assertCanLose(opportunity);
    opportunity.lose(now);
    await this.deps.opportunityRepository.update(opportunity);
    await this.deps.eventPublisher.publish(opportunity.pullDomainEvents());
    return opportunity;
  }

  async archive(id: OpportunityId, now?: Date): Promise<Opportunity> {
    const opportunity = await this.getById(id);
    OpportunityPolicy.assertCanTransition(
      opportunity,
      OpportunityStatus.ARCHIVED,
    );
    opportunity.archive(now);
    await this.deps.opportunityRepository.archive(id);
    await this.deps.opportunityRepository.update(opportunity);
    await this.deps.eventPublisher.publish(opportunity.pullDomainEvents());
    return opportunity;
  }

  async getById(id: OpportunityId): Promise<Opportunity> {
    const opportunity = await this.deps.opportunityRepository.findById(id);
    if (!opportunity) throw new OpportunityNotFoundError(id);
    return opportunity;
  }

  async listByCustomer(customerId: CustomerId): Promise<Opportunity[]> {
    return this.deps.opportunityRepository.findByCustomer(customerId);
  }

  private async progress(
    id: OpportunityId,
    to: OpportunityStatus,
    apply: (o: Opportunity) => void,
  ): Promise<Opportunity> {
    const opportunity = await this.getById(id);
    OpportunityPolicy.assertCanTransition(opportunity, to);
    apply(opportunity);
    await this.deps.opportunityRepository.update(opportunity);
    await this.deps.eventPublisher.publish(opportunity.pullDomainEvents());
    return opportunity;
  }
}
