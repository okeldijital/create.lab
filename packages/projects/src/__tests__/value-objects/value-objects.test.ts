import { describe, expect, it } from "vitest";
import { ProjectPriority } from "../../enums/ProjectPriority.js";
import { ProjectValidationError } from "../../errors/ProjectErrors.js";
import { BudgetReference } from "../../value-objects/BudgetReference.js";
import { DeliverableName } from "../../value-objects/DeliverableName.js";
import { ObjectiveName } from "../../value-objects/ObjectiveName.js";
import { ObjectiveProgress } from "../../value-objects/ObjectiveProgress.js";
import { PhaseName } from "../../value-objects/PhaseName.js";
import { Priority } from "../../value-objects/Priority.js";
import { ProjectDescription } from "../../value-objects/ProjectDescription.js";
import { ProjectName } from "../../value-objects/ProjectName.js";

describe("Value objects", () => {
  it("ProjectName requires non-empty", () => {
    expect(() => ProjectName.create("")).toThrow(ProjectValidationError);
    expect(ProjectName.create("  Album  ").value).toBe("Album");
  });

  it("ProjectDescription allows null", () => {
    expect(ProjectDescription.create(null).value).toBeNull();
  });

  it("ObjectiveProgress clamps 0–100", () => {
    expect(() => ObjectiveProgress.create(-1)).toThrow(ProjectValidationError);
    expect(() => ObjectiveProgress.create(101)).toThrow(ProjectValidationError);
    expect(ObjectiveProgress.create(50).value).toBe(50);
    expect(ObjectiveProgress.complete().isComplete).toBe(true);
  });

  it("BudgetReference optional", () => {
    expect(BudgetReference.create(null).value).toBeNull();
    expect(BudgetReference.create("BUD-1").value).toBe("BUD-1");
  });

  it("Priority validates enum", () => {
    expect(Priority.create().value).toBe(ProjectPriority.NORMAL);
    expect(() => Priority.create("NOPE" as ProjectPriority)).toThrow(
      ProjectValidationError,
    );
  });

  it("names for deliverable/phase/objective", () => {
    expect(DeliverableName.create("Master").value).toBe("Master");
    expect(PhaseName.create("Review").value).toBe("Review");
    expect(ObjectiveName.create("Launch").value).toBe("Launch");
  });
});
