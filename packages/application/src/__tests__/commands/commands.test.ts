import { describe, expect, it } from "vitest";
import {
  activateContractCommand,
  approveReviewCommand,
  archiveOrganizationCommand,
  createAssetCommand,
  createEngagementCommand,
  createInvoiceCommand,
  createKnowledgeArticleCommand,
  createOrganizationCommand,
  createPortfolioCommand,
  createProjectCommand,
  createQuoteCommand,
  deliverProjectCommand,
  issueQuoteCommand,
  startProductionCommand,
} from "../../commands/index.js";

describe("Commands", () => {
  it("createOrganizationCommand", () => {
    const c = createOrganizationCommand({ name: "Acme", slug: "acme" });
    expect(c.type).toBe("CreateOrganization");
    expect(c.name).toBe("Acme");
  });

  it("archiveOrganizationCommand", () => {
    expect(archiveOrganizationCommand("o1").organizationId).toBe("o1");
  });

  it("createProjectCommand", () => {
    const c = createProjectCommand({ name: "P" });
    expect(c.type).toBe("CreateProject");
  });

  it("startProductionCommand", () => {
    expect(startProductionCommand("pr1").type).toBe("StartProduction");
  });

  it("createInvoiceCommand carries lines", () => {
    const c = createInvoiceCommand({
      customerId: "c1",
      lines: [{ description: "x", quantity: 1, unitAmountMinor: 100 }],
    });
    expect(c.lines).toHaveLength(1);
  });

  it("createQuoteCommand", () => {
    expect(
      createQuoteCommand({ customerId: "c", title: "T" }).type,
    ).toBe("CreateQuote");
  });

  it("issueQuoteCommand", () => {
    expect(issueQuoteCommand("q1").quoteId).toBe("q1");
  });

  it("activateContractCommand", () => {
    expect(activateContractCommand("ct1").type).toBe("ActivateContract");
  });

  it("createEngagementCommand", () => {
    expect(
      createEngagementCommand({ name: "E", customerId: "c" }).type,
    ).toBe("CreateEngagement");
  });

  it("createPortfolioCommand", () => {
    expect(
      createPortfolioCommand({
        name: "Port",
        startDate: "2026-01-01",
      }).type,
    ).toBe("CreatePortfolio");
  });

  it("createKnowledgeArticleCommand", () => {
    expect(
      createKnowledgeArticleCommand({
        title: "SOP",
        categoryId: "cat",
      }).type,
    ).toBe("CreateKnowledgeArticle");
  });

  it("createAssetCommand", () => {
    expect(createAssetCommand({ name: "A" }).type).toBe("CreateAsset");
  });

  it("approveReviewCommand", () => {
    expect(approveReviewCommand({ reviewId: "r1" }).type).toBe(
      "ApproveReview",
    );
  });

  it("deliverProjectCommand", () => {
    expect(deliverProjectCommand("d1").type).toBe("DeliverProject");
  });

  it("commands are plain data objects", () => {
    const c = createOrganizationCommand({ name: "X" });
    expect(typeof c).toBe("object");
    expect("handle" in c).toBe(false);
  });
});
