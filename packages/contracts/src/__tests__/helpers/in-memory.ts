import type { AnyDomainEvent } from "@creative-lab/core";
import type { CustomerId } from "@creative-lab/crm";
import type {
  Organization,
  OrganizationId,
  OrganizationRepository,
  OrganizationSlug,
} from "@creative-lab/organization";
import type { QuoteId } from "@creative-lab/quotation";
import type { Contract } from "../../aggregates/Contract/Contract.js";
import type { ContractAmendment } from "../../aggregates/ContractAmendment/ContractAmendment.js";
import type { ContractTerm } from "../../aggregates/ContractTerm/ContractTerm.js";
import type { ContractVersion } from "../../aggregates/ContractVersion/ContractVersion.js";
import type { ContractStatus } from "../../enums/ContractStatus.js";
import { ContractVersionStatus } from "../../enums/ContractVersionStatus.js";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { ContractAmendmentRepository } from "../../repositories/ContractAmendmentRepository.js";
import type { ContractRepository } from "../../repositories/ContractRepository.js";
import type { ContractTermRepository } from "../../repositories/ContractTermRepository.js";
import type { ContractVersionRepository } from "../../repositories/ContractVersionRepository.js";
import type {
  ContractAmendmentId,
  ContractId,
  ContractTermId,
  ContractVersionId,
} from "../../types/ids.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const v = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === v) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryContractRepository implements ContractRepository {
  private readonly byId = new Map<string, Contract>();
  async findById(id: ContractId): Promise<Contract | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Contract[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByCustomer(customerId: CustomerId): Promise<Contract[]> {
    return [...this.byId.values()].filter((c) => c.customerId === customerId);
  }
  async findByQuotation(quotationId: QuoteId): Promise<Contract[]> {
    return [...this.byId.values()].filter(
      (c) => c.quotationId === quotationId,
    );
  }
  async findByStatus(status: ContractStatus): Promise<Contract[]> {
    return [...this.byId.values()].filter((c) => c.status === status);
  }
  async findByContractNumber(
    organizationId: OrganizationId,
    contractNumber: string,
  ): Promise<Contract | null> {
    return (
      [...this.byId.values()].find(
        (c) =>
          c.organizationId === organizationId &&
          c.contractNumber.value === contractNumber,
      ) ?? null
    );
  }
  async save(contract: Contract): Promise<void> {
    this.byId.set(contract.id, contract);
  }
  async update(contract: Contract): Promise<void> {
    this.byId.set(contract.id, contract);
  }
  async archive(id: ContractId): Promise<void> {
    void id;
  }
  async exists(id: ContractId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryContractVersionRepository
  implements ContractVersionRepository
{
  private readonly byId = new Map<string, ContractVersion>();
  async findById(id: ContractVersionId): Promise<ContractVersion | null> {
    return this.byId.get(id) ?? null;
  }
  async findByContract(contractId: ContractId): Promise<ContractVersion[]> {
    return [...this.byId.values()].filter((v) => v.contractId === contractId);
  }
  async findCurrentVersion(
    contractId: ContractId,
  ): Promise<ContractVersion | null> {
    return (
      [...this.byId.values()].find(
        (v) =>
          v.contractId === contractId &&
          v.status === ContractVersionStatus.CURRENT,
      ) ?? null
    );
  }
  async save(version: ContractVersion): Promise<void> {
    this.byId.set(version.id, version);
  }
  async update(version: ContractVersion): Promise<void> {
    this.byId.set(version.id, version);
  }
  async exists(id: ContractVersionId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryContractTermRepository
  implements ContractTermRepository
{
  private readonly byId = new Map<string, ContractTerm>();
  async findById(id: ContractTermId): Promise<ContractTerm | null> {
    return this.byId.get(id) ?? null;
  }
  async findByVersion(versionId: ContractVersionId): Promise<ContractTerm[]> {
    return [...this.byId.values()].filter(
      (t) => t.contractVersionId === versionId,
    );
  }
  async save(term: ContractTerm): Promise<void> {
    this.byId.set(term.id, term);
  }
  async update(term: ContractTerm): Promise<void> {
    this.byId.set(term.id, term);
  }
  async delete(id: ContractTermId): Promise<void> {
    this.byId.delete(id);
  }
  async exists(id: ContractTermId): Promise<boolean> {
    return this.byId.has(id);
  }
}

export class InMemoryContractAmendmentRepository
  implements ContractAmendmentRepository
{
  private readonly byId = new Map<string, ContractAmendment>();
  async findById(
    id: ContractAmendmentId,
  ): Promise<ContractAmendment | null> {
    return this.byId.get(id) ?? null;
  }
  async findByContract(
    contractId: ContractId,
  ): Promise<ContractAmendment[]> {
    return [...this.byId.values()].filter((a) => a.contractId === contractId);
  }
  async save(amendment: ContractAmendment): Promise<void> {
    this.byId.set(amendment.id, amendment);
  }
  async update(amendment: ContractAmendment): Promise<void> {
    this.byId.set(amendment.id, amendment);
  }
  async exists(id: ContractAmendmentId): Promise<boolean> {
    return this.byId.has(id);
  }
}
