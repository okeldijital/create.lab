import { describe, expect, it } from "vitest";
import {
  findInvoicesQuery,
  getOrganizationQuery,
  getProjectQuery,
  listAssetsQuery,
  searchKnowledgeQuery,
} from "../../queries/index.js";

describe("Queries", () => {
  it("getProjectQuery", () => {
    expect(getProjectQuery("p1")).toEqual({
      type: "GetProject",
      projectId: "p1",
    });
  });

  it("findInvoicesQuery defaults", () => {
    expect(findInvoicesQuery().type).toBe("FindInvoices");
  });

  it("findInvoicesQuery filters", () => {
    const q = findInvoicesQuery({ status: "ISSUED", customerId: "c" });
    expect(q.status).toBe("ISSUED");
    expect(q.customerId).toBe("c");
  });

  it("searchKnowledgeQuery", () => {
    const q = searchKnowledgeQuery({ titleContains: "sop" });
    expect(q.type).toBe("SearchKnowledge");
    expect(q.titleContains).toBe("sop");
  });

  it("listAssetsQuery", () => {
    expect(listAssetsQuery({ projectId: "p" }).projectId).toBe("p");
  });

  it("getOrganizationQuery", () => {
    expect(getOrganizationQuery("o1").organizationId).toBe("o1");
  });

  it("queries never mutate — frozen shape", () => {
    const q = getProjectQuery("p");
    expect(Object.isExtensible(q)).toBe(true);
    expect(q.type).toBe("GetProject");
  });
});
