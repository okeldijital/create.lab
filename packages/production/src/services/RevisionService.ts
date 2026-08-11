import {
  Revision,
  type CreateRevisionProps,
} from "../aggregates/Revision/Revision.js";
import {
  ProductionNotFoundError,
  RevisionNotFoundError,
} from "../errors/ProductionErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { ProductionLifecyclePolicy } from "../policies/ProductionLifecyclePolicy.js";
import { RevisionPolicy } from "../policies/RevisionPolicy.js";
import type { ProductionRepository } from "../repositories/ProductionRepository.js";
import type { RevisionRepository } from "../repositories/RevisionRepository.js";
import type { ProductionId, RevisionId } from "../types/ids.js";

export type RevisionServiceDeps = {
  revisionRepository: RevisionRepository;
  productionRepository: ProductionRepository;
  eventPublisher: DomainEventPublisher;
};

export type RequestRevisionProps = Omit<
  CreateRevisionProps,
  "revisionNumber"
> & {
  revisionNumber?: number;
};

export class RevisionService {
  constructor(private readonly deps: RevisionServiceDeps) {}

  async request(props: RequestRevisionProps): Promise<Revision> {
    const production = await this.deps.productionRepository.findById(
      props.productionId,
    );
    if (!production) throw new ProductionNotFoundError(props.productionId);
    ProductionLifecyclePolicy.assertAcceptsChildActivity(production);

    const existing = await this.deps.revisionRepository.findByProduction(
      props.productionId,
    );
    const revisionNumber =
      props.revisionNumber ?? RevisionPolicy.nextNumber(existing).value;
    RevisionPolicy.assertSequential(existing, revisionNumber);

    const revision = Revision.create({ ...props, revisionNumber });
    await this.deps.revisionRepository.save(revision);
    await this.deps.eventPublisher.publish(revision.pullDomainEvents());
    return revision;
  }

  async start(id: RevisionId, now?: Date): Promise<Revision> {
    const revision = await this.getById(id);
    revision.start(now);
    await this.deps.revisionRepository.update(revision);
    await this.deps.eventPublisher.publish(revision.pullDomainEvents());
    return revision;
  }

  async complete(id: RevisionId, now?: Date): Promise<Revision> {
    const revision = await this.getById(id);
    revision.complete(now);
    await this.deps.revisionRepository.update(revision);
    await this.deps.eventPublisher.publish(revision.pullDomainEvents());
    return revision;
  }

  async close(id: RevisionId, now?: Date): Promise<Revision> {
    const revision = await this.getById(id);
    revision.close(now);
    await this.deps.revisionRepository.close(id);
    await this.deps.revisionRepository.update(revision);
    await this.deps.eventPublisher.publish(revision.pullDomainEvents());
    return revision;
  }

  async getById(id: RevisionId): Promise<Revision> {
    const revision = await this.deps.revisionRepository.findById(id);
    if (!revision) throw new RevisionNotFoundError(id);
    return revision;
  }

  async listByProduction(productionId: ProductionId): Promise<Revision[]> {
    return this.deps.revisionRepository.findByProduction(productionId);
  }
}
