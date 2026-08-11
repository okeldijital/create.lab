import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  CategoryInUseError,
  DuplicateArticleNumberError,
  DuplicateCategoryNameError,
  DuplicateKnowledgeReferenceError,
  InvalidKnowledgeStateError,
  KnowledgeAlreadyActiveError,
  KnowledgeArticleNotFoundError,
  KnowledgeCategoryNotFoundError,
  KnowledgeReferenceNotFoundError,
  KnowledgeValidationError,
  KnowledgeVersionNotFoundError,
} from "../../errors/KnowledgeErrors.js";

describe("Knowledge domain errors", () => {
  it("extends DomainError with codes", () => {
    const cases = [
      new KnowledgeArticleNotFoundError("a1"),
      new KnowledgeVersionNotFoundError("v1"),
      new KnowledgeCategoryNotFoundError("c1"),
      new KnowledgeReferenceNotFoundError("r1"),
      new DuplicateArticleNumberError("N", "org"),
      new DuplicateCategoryNameError("Name", "org"),
      new DuplicateKnowledgeReferenceError("s", "t", "REFERENCES"),
      new KnowledgeAlreadyActiveError("a1"),
      new InvalidKnowledgeStateError("bad"),
      new KnowledgeValidationError("invalid"),
      new CategoryInUseError("c1"),
    ];
    for (const err of cases) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBeTruthy();
      expect(err.message.length).toBeGreaterThan(0);
    }
  });

  it("specific codes", () => {
    expect(new KnowledgeArticleNotFoundError("x").code).toBe(
      "KNOWLEDGE_ARTICLE_NOT_FOUND",
    );
    expect(new DuplicateArticleNumberError("N", "o").code).toBe(
      "DUPLICATE_ARTICLE_NUMBER",
    );
    expect(new CategoryInUseError("c").code).toBe("CATEGORY_IN_USE");
    expect(new KnowledgeAlreadyActiveError("a").code).toBe(
      "KNOWLEDGE_ALREADY_ACTIVE",
    );
  });
});
