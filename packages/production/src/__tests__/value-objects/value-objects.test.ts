import { describe, expect, it } from "vitest";
import { ProductionPriority } from "../../enums/ProductionPriority.js";
import {
  DuplicateRevisionError,
  InvalidSessionError,
  ProductionValidationError,
} from "../../errors/ProductionErrors.js";
import { MilestoneName } from "../../value-objects/MilestoneName.js";
import { ProductionDescription } from "../../value-objects/ProductionDescription.js";
import { ProductionName } from "../../value-objects/ProductionName.js";
import { ProductionPriorityVO } from "../../value-objects/ProductionPriority.js";
import { RevisionNumber } from "../../value-objects/RevisionNumber.js";
import { RevisionReason } from "../../value-objects/RevisionReason.js";
import { SessionDuration } from "../../value-objects/SessionDuration.js";
import { SessionNotes } from "../../value-objects/SessionNotes.js";

describe("Value objects", () => {
  it("ProductionName required", () => {
    expect(() => ProductionName.create("")).toThrow(ProductionValidationError);
    expect(ProductionName.create("  Mix  ").value).toBe("Mix");
  });

  it("ProductionDescription optional", () => {
    expect(ProductionDescription.create(null).value).toBeNull();
  });

  it("SessionNotes optional", () => {
    expect(SessionNotes.create(undefined).value).toBeNull();
    expect(SessionNotes.create("note").value).toBe("note");
  });

  it("MilestoneName required", () => {
    expect(MilestoneName.create("Mixing").value).toBe("Mixing");
    expect(() => MilestoneName.create("")).toThrow(ProductionValidationError);
  });

  it("RevisionReason required", () => {
    expect(() => RevisionReason.create("")).toThrow(ProductionValidationError);
    expect(RevisionReason.create("Fix levels").value).toBe("Fix levels");
  });

  it("RevisionNumber sequential integer ≥1", () => {
    expect(RevisionNumber.first().value).toBe(1);
    expect(RevisionNumber.first().next().value).toBe(2);
    expect(() => RevisionNumber.create(0)).toThrow(DuplicateRevisionError);
  });

  it("ProductionPriorityVO validates enum", () => {
    expect(ProductionPriorityVO.create().value).toBe(ProductionPriority.NORMAL);
    expect(() =>
      ProductionPriorityVO.create("NOPE" as ProductionPriority),
    ).toThrow(ProductionValidationError);
  });

  it("SessionDuration must be positive", () => {
    expect(() => SessionDuration.fromMilliseconds(0)).toThrow(
      InvalidSessionError,
    );
    const a = new Date("2026-01-01T00:00:00Z");
    const b = new Date("2026-01-01T01:00:00Z");
    expect(SessionDuration.between(a, b).milliseconds).toBe(3_600_000);
  });

  it("value equality", () => {
    const a = ProductionName.create("A");
    const b = ProductionName.create("A");
    expect(a.equals(b)).toBe(true);
  });
});
