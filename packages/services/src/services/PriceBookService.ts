import type {
  OrganizationId,
  OrganizationRepository,
} from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import {
  PriceBook,
  type CreatePriceBookProps,
} from "../aggregates/PriceBook/PriceBook.js";
import { PriceBookStatus } from "../enums/PriceBookStatus.js";
import { PriceBookNotFoundError } from "../errors/ServicesErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { PriceBookPolicy } from "../policies/PriceBookPolicy.js";
import type { PriceBookRepository } from "../repositories/PriceBookRepository.js";
import type { PriceBookId } from "../types/ids.js";

export type PriceBookServiceDeps = {
  priceBookRepository: PriceBookRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class PriceBookService {
  constructor(private readonly deps: PriceBookServiceDeps) {}

  async create(props: CreatePriceBookProps): Promise<PriceBook> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    if (props.effectiveFrom || props.effectiveTo) {
      PriceBookPolicy.assertEffectivePeriod(
        props.effectiveFrom ?? new Date(),
        props.effectiveTo ?? null,
      );
    }
    const book = PriceBook.create(props);
    await this.deps.priceBookRepository.save(book);
    await this.deps.eventPublisher.publish(book.pullDomainEvents());
    return book;
  }

  async publish(id: PriceBookId, now?: Date): Promise<PriceBook> {
    const book = await this.getById(id);
    const published = await this.deps.priceBookRepository.findPublished(
      book.organizationId,
    );
    PriceBookPolicy.assertCanPublish(book, published);
    book.publish(now);
    await this.deps.priceBookRepository.update(book);
    await this.deps.eventPublisher.publish(book.pullDomainEvents());
    return book;
  }

  async retire(id: PriceBookId, now?: Date): Promise<PriceBook> {
    const book = await this.getById(id);
    PriceBookPolicy.assertCanTransition(book, PriceBookStatus.RETIRED);
    book.retire(now);
    await this.deps.priceBookRepository.update(book);
    await this.deps.eventPublisher.publish(book.pullDomainEvents());
    return book;
  }

  async archive(id: PriceBookId, now?: Date): Promise<PriceBook> {
    const book = await this.getById(id);
    PriceBookPolicy.assertCanTransition(book, PriceBookStatus.ARCHIVED);
    book.archive(now);
    await this.deps.priceBookRepository.archive(id);
    await this.deps.priceBookRepository.update(book);
    await this.deps.eventPublisher.publish(book.pullDomainEvents());
    return book;
  }

  async getById(id: PriceBookId): Promise<PriceBook> {
    const book = await this.deps.priceBookRepository.findById(id);
    if (!book) throw new PriceBookNotFoundError(id);
    return book;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<PriceBook[]> {
    return this.deps.priceBookRepository.findByOrganization(organizationId);
  }

  async listPublished(organizationId: OrganizationId): Promise<PriceBook[]> {
    return this.deps.priceBookRepository.findPublished(organizationId);
  }
}
