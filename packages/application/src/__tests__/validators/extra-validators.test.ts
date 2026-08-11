import { describe, expect, it } from "vitest";
import {
  activateContractCommand,
  createInvoiceCommand,
  issueQuoteCommand,
  startProductionCommand,
} from "../../commands/index.js";
import { ValidationError } from "../../errors/ApplicationErrors.js";
import {
  findInvoicesQuery,
  searchKnowledgeQuery,
} from "../../queries/index.js";
import { validateQueryRequired, validateRequired } from "../../validators/index.js";

describe("Extra validation coverage", () => {
  it("startProduction requires productionId", () => {
    expect(() =>
      validateRequired(startProductionCommand(""), ["productionId"]),
    ).toThrow(ValidationError);
  });

  it("issueQuote requires quoteId", () => {
    expect(() =>
      validateRequired(issueQuoteCommand(""), ["quoteId"]),
    ).toThrow(ValidationError);
  });

  it("activateContract requires contractId", () => {
    expect(() =>
      validateRequired(activateContractCommand(""), ["contractId"]),
    ).toThrow(ValidationError);
  });

  it("createInvoice requires customerId and lines", () => {
    expect(() =>
      validateRequired(
        createInvoiceCommand({
          customerId: "c",
          lines: [{ description: "x", quantity: 1, unitAmountMinor: 1 }],
        }),
        ["customerId", "lines"],
      ),
    ).not.toThrow();
  });

  it("search query optional fields", () => {
    expect(() =>
      validateQueryRequired(searchKnowledgeQuery({}), []),
    ).not.toThrow();
  });

  it("find invoices query has type", () => {
    expect(findInvoicesQuery({ status: "PAID" }).type).toBe("FindInvoices");
  });

  it("startProduction valid id", () => {
    expect(() =>
      validateRequired(startProductionCommand("prod-1"), ["productionId"]),
    ).not.toThrow();
  });

  it("issueQuote valid id", () => {
    expect(() =>
      validateRequired(issueQuoteCommand("q-1"), ["quoteId"]),
    ).not.toThrow();
  });
});
