import {
  ProductionSession,
  type CreateProductionSessionProps,
} from "../aggregates/ProductionSession/ProductionSession.js";
import {
  ProductionNotFoundError,
  SessionNotFoundError,
} from "../errors/ProductionErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ProductionLifecyclePolicy } from "../policies/ProductionLifecyclePolicy.js";
import { SessionPolicy } from "../policies/SessionPolicy.js";
import type { ProductionRepository } from "../repositories/ProductionRepository.js";
import type { SessionRepository } from "../repositories/SessionRepository.js";
import type { ProductionId, ProductionSessionId } from "../types/ids.js";

export type SessionServiceDeps = {
  sessionRepository: SessionRepository;
  productionRepository: ProductionRepository;
  eventPublisher: DomainEventPublisher;
};

export class SessionService {
  constructor(private readonly deps: SessionServiceDeps) {}

  async open(props: CreateProductionSessionProps): Promise<ProductionSession> {
    const production = await this.deps.productionRepository.findById(
      props.productionId,
    );
    if (!production) throw new ProductionNotFoundError(props.productionId);
    ProductionLifecyclePolicy.assertAcceptsChildActivity(production);

    const existing = await this.deps.sessionRepository.findByProduction(
      props.productionId,
    );
    SessionPolicy.assertNoOpenSession(existing, props.productionId);

    const session = ProductionSession.create(props);
    await this.deps.sessionRepository.save(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async pause(
    id: ProductionSessionId,
    now?: Date,
  ): Promise<ProductionSession> {
    const session = await this.getById(id);
    session.pause(now);
    await this.deps.sessionRepository.update(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async resume(
    id: ProductionSessionId,
    now?: Date,
  ): Promise<ProductionSession> {
    const session = await this.getById(id);
    session.resume(now);
    await this.deps.sessionRepository.update(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async complete(
    id: ProductionSessionId,
    endedAt?: Date,
  ): Promise<ProductionSession> {
    const session = await this.getById(id);
    const end = endedAt ?? new Date();
    SessionPolicy.assertEndAfterStart(session.startedAt, end);
    session.complete(end);
    await this.deps.sessionRepository.update(session);
    await this.deps.eventPublisher.publish(session.pullDomainEvents());
    return session;
  }

  async getById(id: ProductionSessionId): Promise<ProductionSession> {
    const session = await this.deps.sessionRepository.findById(id);
    if (!session) throw new SessionNotFoundError(id);
    return session;
  }

  async listByProduction(
    productionId: ProductionId,
  ): Promise<ProductionSession[]> {
    return this.deps.sessionRepository.findByProduction(productionId);
  }
}
