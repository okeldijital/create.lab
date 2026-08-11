import { describe, expect, it } from "vitest";
import { KnowledgeValidationError } from "../../errors/KnowledgeErrors.js";
import { ArticleNumber } from "../../value-objects/ArticleNumber.js";
import { ArticleTitle } from "../../value-objects/ArticleTitle.js";
import { CategoryName } from "../../value-objects/CategoryName.js";
import { KnowledgeDescription } from "../../value-objects/KnowledgeDescription.js";
import { KnowledgeSummary } from "../../value-objects/KnowledgeSummary.js";
import { ReferenceLabel } from "../../value-objects/ReferenceLabel.js";
import { VersionNumber } from "../../value-objects/VersionNumber.js";

describe("ArticleNumber", () => {
  it("validates and generates", () => {
    expect(() => ArticleNumber.create("")).toThrow(KnowledgeValidationError);
    expect(ArticleNumber.create(" K-1 ").value).toBe("K-1");
    expect(ArticleNumber.generate().value.startsWith("KNW-")).toBe(true);
  });
  it("equality and max length", () => {
    expect(
      ArticleNumber.create("A").equals(ArticleNumber.create("A")),
    ).toBe(true);
    expect(() => ArticleNumber.create("x".repeat(65))).toThrow(
      KnowledgeValidationError,
    );
  });
});

describe("ArticleTitle", () => {
  it("required and trims", () => {
    expect(ArticleTitle.create("  Title  ").value).toBe("Title");
    expect(() => ArticleTitle.create("")).toThrow(KnowledgeValidationError);
  });
  it("equality and max length", () => {
    expect(ArticleTitle.create("T").equals(ArticleTitle.create("T"))).toBe(
      true,
    );
    expect(() => ArticleTitle.create("x".repeat(301))).toThrow(
      KnowledgeValidationError,
    );
  });
});

describe("VersionNumber", () => {
  it("positive integer", () => {
    expect(VersionNumber.create(1).value).toBe(1);
    expect(() => VersionNumber.create(0)).toThrow(KnowledgeValidationError);
    expect(() => VersionNumber.create(1.5)).toThrow(KnowledgeValidationError);
  });
  it("equality", () => {
    expect(VersionNumber.create(2).equals(VersionNumber.create(2))).toBe(true);
  });
});

describe("CategoryName", () => {
  it("validates", () => {
    expect(CategoryName.create(" SOPs ").value).toBe("SOPs");
    expect(() => CategoryName.create("")).toThrow(KnowledgeValidationError);
  });
  it("equality", () => {
    expect(CategoryName.create("A").equals(CategoryName.create("A"))).toBe(
      true,
    );
  });
});

describe("KnowledgeSummary / Description / ReferenceLabel", () => {
  it("summary required", () => {
    expect(KnowledgeSummary.create(" Summary ").value).toBe("Summary");
    expect(() => KnowledgeSummary.create("")).toThrow(KnowledgeValidationError);
  });
  it("description optional", () => {
    expect(KnowledgeDescription.create(null).value).toBeNull();
    expect(KnowledgeDescription.create("D").value).toBe("D");
  });
  it("label optional", () => {
    expect(ReferenceLabel.create(null).value).toBeNull();
    expect(ReferenceLabel.create(" see ").value).toBe("see");
  });
  it("equality", () => {
    expect(
      KnowledgeSummary.create("S").equals(KnowledgeSummary.create("S")),
    ).toBe(true);
    expect(
      KnowledgeDescription.create("D").equals(
        KnowledgeDescription.create("D"),
      ),
    ).toBe(true);
    expect(
      ReferenceLabel.create("L").equals(ReferenceLabel.create("L")),
    ).toBe(true);
  });
  it("immutability via value object props", () => {
    const n = ArticleNumber.create("IMM");
    expect(Object.isFrozen(n)).toBe(true);
  });
});
