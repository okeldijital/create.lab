import {
  PriceRule,
  type CreatePriceRuleProps,
} from "../aggregates/PriceRule/PriceRule.js";
import {
  PriceBookNotFoundError,
  PriceRuleNotFoundError,
  ServiceNotFoundError,
} from "../errors/ServicesErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { PriceRulePolicy } from "../policies/PriceRulePolicy.js";
import type { PriceBookRepository } from "../repositories/PriceBookRepository.js";
import type { PriceRuleRepository } from "../repositories/PriceRuleRepository.js";
import type { ServiceRepository } from "../repositories/ServiceRepository.js";
import type { PriceBookId, PriceRuleId, ServiceId } from "../types/ids.js";

export type PriceRuleServiceDeps = {
  priceRuleRepository: PriceRuleRepository;
  priceBookRepository: PriceBookRepository;
  serviceRepository: ServiceRepository;
  eventPublisher: DomainEventPublisher;
};

export class PriceRuleService {
  constructor(private readonly deps: PriceRuleServiceDeps) {}

  async create(props: CreatePriceRuleProps): Promise<PriceRule> {
    const book = await this.deps.priceBookRepository.findById(
      props.priceBookId,
    );
    if (!book) throw new PriceBookNotFoundError(props.priceBookId);
    const service = await this.deps.serviceRepository.findById(props.serviceId);
    if (!service) throw new ServiceNotFoundError(props.serviceId);

    PriceRulePolicy.assertCurrencyMatchesBook(book, props.currency);
    const range = PriceRulePolicy.assertValidRange(props);
    PriceRulePolicy.assertPricingModelCompatible(service, range);

    const existing = await this.deps.priceRuleRepository.findByPriceBook(
      props.priceBookId,
    );
    PriceRulePolicy.assertNoDuplicate(
      props.serviceId,
      props.priceBookId,
      existing,
    );

    const rule = PriceRule.create(props);
    await this.deps.priceRuleRepository.save(rule);
    await this.deps.eventPublisher.publish(rule.pullDomainEvents());
    return rule;
  }

  async updatePricing(
    id: PriceRuleId,
    input: {
      basePriceMinor: number;
      minimumPriceMinor?: number;
      maximumPriceMinor?: number;
    },
    now?: Date,
  ): Promise<PriceRule> {
    const rule = await this.getById(id);
    PriceRulePolicy.assertMutable(rule);
    PriceRulePolicy.assertValidRange({
      ...input,
      currency: rule.currencyCode,
    });
    rule.updatePricing(input, now);
    await this.deps.priceRuleRepository.update(rule);
    await this.deps.eventPublisher.publish(rule.pullDomainEvents());
    return rule;
  }

  async archive(id: PriceRuleId, now?: Date): Promise<PriceRule> {
    const rule = await this.getById(id);
    rule.archive(now);
    await this.deps.priceRuleRepository.archive(id);
    await this.deps.priceRuleRepository.update(rule);
    await this.deps.eventPublisher.publish(rule.pullDomainEvents());
    return rule;
  }

  async getById(id: PriceRuleId): Promise<PriceRule> {
    const rule = await this.deps.priceRuleRepository.findById(id);
    if (!rule) throw new PriceRuleNotFoundError(id);
    return rule;
  }

  async listByPriceBook(priceBookId: PriceBookId): Promise<PriceRule[]> {
    return this.deps.priceRuleRepository.findByPriceBook(priceBookId);
  }

  async listByService(serviceId: ServiceId): Promise<PriceRule[]> {
    return this.deps.priceRuleRepository.findByService(serviceId);
  }
}
