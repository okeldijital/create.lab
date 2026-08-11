import { describe, expect, it } from "vitest";
import { DomainError } from "@creative-lab/core";
import {
  ArchivedScheduleError,
  ScheduleNotFoundError,
  TimeBlockOverlapError,
} from "../../errors/index.js";

describe("Scheduling errors", () => {
  it("extend DomainError from core", () => {
    expect(new ScheduleNotFoundError("x")).toBeInstanceOf(DomainError);
    expect(new TimeBlockOverlapError("overlap").code).toBe(
      "TIME_BLOCK_OVERLAP",
    );
    expect(new ArchivedScheduleError("s1").code).toBe("ARCHIVED_SCHEDULE");
  });
});
