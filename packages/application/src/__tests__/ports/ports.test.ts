import { describe, expect, it } from "vitest";
import type {
  AssetRepository,
  ContractRepository,
  DeliveryRepository,
  EngagementRepository,
  InvoiceRepository,
  KnowledgeArticleRepository,
  OrganizationRepository,
  PortfolioRepository,
  ProductionRepository,
  ProjectRepository,
  QuoteRepository,
  ReviewRepository,
} from "../../ports/index.js";

describe("Repository ports (application re-exports)", () => {
  it("port types are interfaces only — compile-time contracts", () => {
    // Structural checks: empty implementations must satisfy method names.
    const org: Pick<OrganizationRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const project: Pick<ProjectRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const invoice: Pick<InvoiceRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const quote: Pick<QuoteRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const contract: Pick<ContractRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const engagement: Pick<EngagementRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const portfolio: Pick<PortfolioRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const knowledge: Pick<KnowledgeArticleRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const asset: Pick<AssetRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const production: Pick<ProductionRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const review: Pick<ReviewRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };
    const delivery: Pick<DeliveryRepository, "findById" | "save"> = {
      findById: async () => null,
      save: async () => undefined,
    };

    const ports = [
      org,
      project,
      invoice,
      quote,
      contract,
      engagement,
      portfolio,
      knowledge,
      asset,
      production,
      review,
      delivery,
    ];
    expect(ports).toHaveLength(12);
    for (const p of ports) {
      expect(typeof p.findById).toBe("function");
      expect(typeof p.save).toBe("function");
    }
  });
});
