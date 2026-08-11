import { describe, expect, it } from "vitest";
import type {
  AssetDto,
  ContractDto,
  DeliveryDto,
  EngagementDto,
  InvoiceDto,
  KnowledgeArticleDto,
  OrganizationDto,
  PortfolioDto,
  ProductionDto,
  ProjectDto,
  QuoteDto,
  ReviewDto,
} from "../../dto/index.js";

describe("DTO shapes", () => {
  it("OrganizationDto fields", () => {
    const dto: OrganizationDto = {
      id: "1",
      name: "N",
      slug: "s",
      status: "ACTIVE",
      displayName: "N",
      timezone: "UTC",
      locale: "en",
      currency: "USD",
    };
    expect(Object.keys(dto)).toContain("slug");
  });

  it("ProjectDto fields", () => {
    const dto: ProjectDto = {
      id: "1",
      organizationId: "o",
      name: "P",
      status: "DRAFT",
      ownerId: "u",
      description: null,
    };
    expect(dto.description).toBeNull();
  });

  it("remaining DTOs are plain serializable objects", () => {
    const invoice: InvoiceDto = {
      id: "i",
      organizationId: "o",
      invoiceNumber: "INV",
      customerId: "c",
      status: "DRAFT",
      currency: "USD",
      projectId: "p",
    };
    const quote: QuoteDto = {
      id: "q",
      organizationId: "o",
      quoteNumber: "Q",
      customerId: "c",
      status: "DRAFT",
      currency: "USD",
    };
    const contract: ContractDto = {
      id: "c",
      organizationId: "o",
      contractNumber: "C",
      customerId: "cu",
      status: "DRAFT",
      quotationId: "q",
    };
    const engagement: EngagementDto = {
      id: "e",
      organizationId: "o",
      engagementNumber: "E",
      customerId: "c",
      contractId: "ct",
      status: "DRAFT",
    };
    const portfolio: PortfolioDto = {
      id: "pf",
      organizationId: "o",
      portfolioNumber: "P",
      name: "N",
      status: "DRAFT",
      startDate: "2026-01-01",
    };
    const knowledge: KnowledgeArticleDto = {
      id: "k",
      organizationId: "o",
      articleNumber: "A",
      title: "T",
      status: "DRAFT",
      categoryId: "cat",
    };
    const asset: AssetDto = {
      id: "a",
      organizationId: "o",
      name: "N",
      status: "ACTIVE",
      projectId: null,
    };
    const production: ProductionDto = {
      id: "pr",
      organizationId: "o",
      name: "N",
      status: "DRAFT",
      projectId: "p",
    };
    const review: ReviewDto = {
      id: "r",
      organizationId: "o",
      title: "T",
      status: "OPEN",
      projectId: "p",
    };
    const delivery: DeliveryDto = {
      id: "d",
      organizationId: "o",
      status: "READY",
      projectId: "p",
    };
    const all = [
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
    for (const d of all) {
      expect(JSON.parse(JSON.stringify(d))).toEqual(d);
    }
  });
});
