import { describe, expect, it } from "vitest";
import {
  OperationsValidationError,
  OutputVersionConflictError,
  InvalidIncidentStateError,
} from "../../errors/OperationsErrors.js";
import { WorkPriority } from "../../enums/WorkPriority.js";
import { IncidentDescription } from "../../value-objects/IncidentDescription.js";
import { MilestoneName } from "../../value-objects/MilestoneName.js";
import { OutputName } from "../../value-objects/OutputName.js";
import { OutputVersion } from "../../value-objects/OutputVersion.js";
import { Priority } from "../../value-objects/Priority.js";
import { ResolutionNotes } from "../../value-objects/ResolutionNotes.js";
import { SessionDuration } from "../../value-objects/SessionDuration.js";
import { WorkDescription } from "../../value-objects/WorkDescription.js";
import { WorkTitle } from "../../value-objects/WorkTitle.js";

describe("Value objects", () => {
  it("WorkTitle requires non-empty ≤200", () => {
    expect(() => WorkTitle.create("")).toThrow(OperationsValidationError);
    expect(WorkTitle.create("  Mix  ").value).toBe("Mix");
  });

  it("WorkDescription allows null", () => {
    expect(WorkDescription.create(null).value).toBeNull();
    expect(WorkDescription.create("notes").value).toBe("notes");
  });

  it("MilestoneName equality is case-insensitive", () => {
    const a = MilestoneName.create("Recording Complete");
    const b = MilestoneName.create("recording complete");
    expect(a.equals(b)).toBe(true);
  });

  it("OutputVersion increments and rejects <1", () => {
    expect(() => OutputVersion.create(0)).toThrow(OutputVersionConflictError);
    const v = OutputVersion.first();
    expect(v.next().value).toBe(2);
  });

  it("SessionDuration must be positive", () => {
    expect(() => SessionDuration.fromMilliseconds(0)).toThrow(
      OperationsValidationError,
    );
    const start = new Date("2026-01-01T00:00:00Z");
    const end = new Date("2026-01-01T01:00:00Z");
    expect(SessionDuration.between(start, end).milliseconds).toBe(3_600_000);
  });

  it("Priority validates enum", () => {
    expect(Priority.create().value).toBe(WorkPriority.NORMAL);
    expect(() => Priority.create("NOPE" as WorkPriority)).toThrow(
      OperationsValidationError,
    );
  });

  it("Incident VOs require text", () => {
    expect(() => IncidentDescription.create("")).toThrow(
      InvalidIncidentStateError,
    );
    expect(() => ResolutionNotes.create("")).toThrow(InvalidIncidentStateError);
    expect(OutputName.create("Mix").value).toBe("Mix");
  });
});
