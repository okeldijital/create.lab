import { describe, expect, it } from "vitest";
import type { Contract } from "@creative-lab/contracts";
import type { Engagement } from "@creative-lab/engagement";
import type { Quote } from "@creative-lab/quotation";
import { asOrganizationId } from "@creative-lab/organization";
import { CommercialOrchestrationService } from "../../services/CommercialOrchestrationService.js";
import { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import { testContext } from "../helpers/fakes.js";

/**
 * Fake domain services for cross-domain orchestration unit tests.
 * Application coordinates sequence; domain services remain the business edge.
 */
function fakeQuote(status: string): Quote {
  return {
    id: "q1",
    organizationId: "org-1",
    quoteNumber: { value: "Q-1" },
    customerId: "cust-1",
    status,
    currency: { code: "USD" },
  } as unknown as Quote;
}

function fakeContract(status: string): Contract {
  return {
    id: "c1",
    organizationId: "org-1",
    contractNumber: { value: "C-1" },
    customerId: "cust-1",
    status,
    quotationId: "q1",
  } as unknown as Contract;
}

function fakeEngagement(): Engagement {
  return {
    id: "e1",
    organizationId: "org-1",
    engagementNumber: { value: "E-1" },
    customerId: "cust-1",
    contractId: "c1",
    status: "DRAFT",
  } as unknown as Engagement;
}

describe("CommercialOrchestrationService", () => {
  it("sequences issue quote → activate contract → create engagement", async () => {
    const calls: string[] = [];
    const quoteService = {
      issue: async (id: string) => {
        calls.push(`issue:${id}`);
        return fakeQuote("ISSUED");
      },
    };
    const contractService = {
      activate: async (id: string) => {
        calls.push(`activate:${id}`);
        return fakeContract("ACTIVE");
      },
    };
    const engagementService = {
      create: async () => {
        calls.push("create-engagement");
        return fakeEngagement();
      },
    };

    const service = new CommercialOrchestrationService({
      quoteService: quoteService as never,
      contractService: contractService as never,
      engagementService: engagementService as never,
      eventCollector: new CollectingEventPublisher(),
    });

    const result = await service.activateCommercialChain(
      {
        quoteId: "q1",
        contractId: "c1",
        engagement: {
          customerId: "cust-1",
          contractId: "c1",
          startDate: new Date("2026-02-01"),
        },
      },
      testContext(asOrganizationId("org-1")),
    );

    expect(calls).toEqual(["issue:q1", "activate:c1", "create-engagement"]);
    expect(result.quote.status).toBe("ISSUED");
    expect(result.contract.status).toBe("ACTIVE");
    expect(result.engagement.engagementNumber).toBe("E-1");
  });

  it("propagates domain service failures", async () => {
    const service = new CommercialOrchestrationService({
      quoteService: {
        issue: async () => {
          throw new Error("cannot issue");
        },
      } as never,
      contractService: { activate: async () => fakeContract("X") } as never,
      engagementService: { create: async () => fakeEngagement() } as never,
      eventCollector: new CollectingEventPublisher(),
    });

    await expect(
      service.activateCommercialChain(
        {
          quoteId: "q1",
          contractId: "c1",
          engagement: {
            customerId: "c",
            contractId: "c1",
            startDate: new Date(),
          },
        },
        testContext(asOrganizationId("org-1")),
      ),
    ).rejects.toThrow("cannot issue");
  });
});
