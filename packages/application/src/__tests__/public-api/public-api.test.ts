import { describe, expect, it } from "vitest";
import * as Application from "../../index.js";

describe("Public API surface", () => {
  it("exports command factories", () => {
    expect(typeof Application.createOrganizationCommand).toBe("function");
    expect(typeof Application.createProjectCommand).toBe("function");
    expect(typeof Application.createPortfolioCommand).toBe("function");
    expect(typeof Application.createKnowledgeArticleCommand).toBe("function");
    expect(typeof Application.issueQuoteCommand).toBe("function");
    expect(typeof Application.activateContractCommand).toBe("function");
    expect(typeof Application.startProductionCommand).toBe("function");
    expect(typeof Application.createInvoiceCommand).toBe("function");
    expect(typeof Application.createEngagementCommand).toBe("function");
    expect(typeof Application.createAssetCommand).toBe("function");
    expect(typeof Application.approveReviewCommand).toBe("function");
    expect(typeof Application.deliverProjectCommand).toBe("function");
    expect(typeof Application.archiveOrganizationCommand).toBe("function");
    expect(typeof Application.createQuoteCommand).toBe("function");
  });

  it("exports query factories", () => {
    expect(typeof Application.getProjectQuery).toBe("function");
    expect(typeof Application.getOrganizationQuery).toBe("function");
    expect(typeof Application.findInvoicesQuery).toBe("function");
    expect(typeof Application.searchKnowledgeQuery).toBe("function");
    expect(typeof Application.listAssetsQuery).toBe("function");
  });

  it("exports handlers", () => {
    expect(Application.CreateOrganizationHandler).toBeTypeOf("function");
    expect(Application.CreateProjectHandler).toBeTypeOf("function");
    expect(Application.CreatePortfolioHandler).toBeTypeOf("function");
    expect(Application.CreateKnowledgeArticleHandler).toBeTypeOf("function");
    expect(Application.SearchKnowledgeHandler).toBeTypeOf("function");
    expect(Application.GetProjectHandler).toBeTypeOf("function");
    expect(Application.GetOrganizationHandler).toBeTypeOf("function");
    expect(Application.ArchiveOrganizationHandler).toBeTypeOf("function");
    expect(Application.StartProductionHandler).toBeTypeOf("function");
    expect(Application.IssueQuoteHandler).toBeTypeOf("function");
    expect(Application.ActivateContractHandler).toBeTypeOf("function");
    expect(Application.FindInvoicesHandler).toBeTypeOf("function");
    expect(Application.ListAssetsHandler).toBeTypeOf("function");
  });

  it("exports mappers", () => {
    expect(Application.OrganizationMapper).toBeTypeOf("function");
    expect(Application.ProjectMapper).toBeTypeOf("function");
    expect(Application.InvoiceMapper).toBeTypeOf("function");
    expect(Application.QuoteMapper).toBeTypeOf("function");
    expect(Application.ContractMapper).toBeTypeOf("function");
    expect(Application.EngagementMapper).toBeTypeOf("function");
    expect(Application.PortfolioMapper).toBeTypeOf("function");
    expect(Application.KnowledgeMapper).toBeTypeOf("function");
    expect(Application.AssetMapper).toBeTypeOf("function");
    expect(Application.ProductionMapper).toBeTypeOf("function");
    expect(Application.ReviewMapper).toBeTypeOf("function");
    expect(Application.DeliveryMapper).toBeTypeOf("function");
  });

  it("exports services and ports", () => {
    expect(Application.UseCaseExecutor).toBeTypeOf("function");
    expect(Application.CollectingEventPublisher).toBeTypeOf("function");
    expect(Application.CommercialOrchestrationService).toBeTypeOf("function");
    expect(Application.INTEGRATION_EVENT_VERSION).toBe(1);
  });

  it("exports application errors", () => {
    expect(Application.ApplicationError).toBeTypeOf("function");
    expect(Application.ValidationError).toBeTypeOf("function");
    expect(Application.AuthorizationError).toBeTypeOf("function");
    expect(Application.NotFoundError).toBeTypeOf("function");
    expect(Application.ConflictError).toBeTypeOf("function");
    expect(Application.ConcurrencyError).toBeTypeOf("function");
    expect(Application.TransactionError).toBeTypeOf("function");
    expect(Application.HandlerNotFoundError).toBeTypeOf("function");
  });

  it("exports validators", () => {
    expect(Application.validateRequired).toBeTypeOf("function");
    expect(Application.validateQueryRequired).toBeTypeOf("function");
    expect(Application.RequiredFieldsCommandValidator).toBeTypeOf("function");
    expect(Application.RequiredFieldsQueryValidator).toBeTypeOf("function");
  });

  it("exports utils", () => {
    expect(Application.newCorrelationId).toBeTypeOf("function");
    expect(Application.toIntegrationEvent).toBeTypeOf("function");
    expect(Application.toIntegrationEvents).toBeTypeOf("function");
    expect(Application.asActorId).toBeTypeOf("function");
  });
});
