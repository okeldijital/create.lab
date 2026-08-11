import type { ContractService } from "@creative-lab/contracts";
import type { EngagementService } from "@creative-lab/engagement";
import type { QuoteService } from "@creative-lab/quotation";
import type { ContractDto, EngagementDto, QuoteDto } from "../dto/common.js";
import { ContractMapper } from "../mappers/ContractMapper.js";
import { EngagementMapper } from "../mappers/EngagementMapper.js";
import { QuoteMapper } from "../mappers/QuoteMapper.js";
import type { ApplicationContext } from "../types/context.js";
import type { CollectingEventPublisher } from "./CollectingEventPublisher.js";

/**
 * Cross-domain commercial orchestration (Quotation → Contract → Engagement).
 * Application-only coordination; business rules remain in domain packages.
 */
export type CommercialOrchestrationDeps = {
  quoteService: QuoteService;
  contractService: ContractService;
  engagementService: EngagementService;
  eventCollector: CollectingEventPublisher;
};

export type ActivateCommercialChainInput = {
  quoteId: string;
  contractId: string;
  engagement: {
    customerId: string;
    contractId: string;
    projectId?: string | null;
    startDate: Date;
    engagementNumber?: string;
  };
};

export type ActivateCommercialChainResult = {
  quote: QuoteDto;
  contract: ContractDto;
  engagement: EngagementDto;
};

export class CommercialOrchestrationService {
  constructor(private readonly deps: CommercialOrchestrationDeps) {}

  /**
   * Issue quote, activate contract, create engagement — sequential orchestration.
   */
  async activateCommercialChain(
    input: ActivateCommercialChainInput,
    context: ApplicationContext,
  ): Promise<ActivateCommercialChainResult> {
    void context;
    const quote = await this.deps.quoteService.issue(input.quoteId as never);
    const contract = await this.deps.contractService.activate(
      input.contractId as never,
    );
    const engagement = await this.deps.engagementService.create({
      organizationId: context.organizationId,
      customerId: input.engagement.customerId as never,
      contractId: input.engagement.contractId as never,
      projectId: (input.engagement.projectId as never) ?? null,
      startDate: input.engagement.startDate,
      engagementNumber: input.engagement.engagementNumber,
    });

    return {
      quote: QuoteMapper.toDto(quote),
      contract: ContractMapper.toDto(contract),
      engagement: EngagementMapper.toDto(engagement),
    };
  }
}
