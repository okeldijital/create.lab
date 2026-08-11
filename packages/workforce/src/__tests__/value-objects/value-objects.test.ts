import { describe, expect, it } from "vitest";
import {
  EmailAddress,
  EmployeeNumber,
  EmploymentPeriod,
  NoticePeriod,
  PhoneNumber,
  PositionTitle,
  ProbationPeriod,
  WorkerName,
  WorkingHours,
} from "../../value-objects/index.js";
import {
  InvalidEmploymentPeriodError,
  WorkerValidationError,
} from "../../errors/WorkforceErrors.js";

describe("Workforce value objects", () => {
  it("WorkerName requires first and last", () => {
    const name = WorkerName.create({ firstName: "Ada", lastName: "Lovelace" });
    expect(name.displayName).toBe("Ada Lovelace");
    expect(() => WorkerName.create({ firstName: "", lastName: "X" })).toThrow(
      WorkerValidationError,
    );
  });

  it("EmailAddress normalizes", () => {
    expect(EmailAddress.create("Ada@Example.COM").value).toBe("ada@example.com");
    expect(() => EmailAddress.create("not-an-email")).toThrow();
  });

  it("PhoneNumber optional null", () => {
    expect(PhoneNumber.create(null)).toBeNull();
    expect(PhoneNumber.create("+1 (555) 123-4567")?.value).toBe("+15551234567");
  });

  it("EmployeeNumber validates", () => {
    expect(EmployeeNumber.create("E-100").value).toBe("E-100");
    expect(() => EmployeeNumber.create("")).toThrow();
  });

  it("EmploymentPeriod rejects inverted dates", () => {
    const start = new Date("2024-01-10");
    const end = new Date("2024-01-01");
    expect(() => EmploymentPeriod.create(start, end)).toThrow(
      InvalidEmploymentPeriodError,
    );
    const period = EmploymentPeriod.create(start, new Date("2024-12-31"));
    expect(period.includes(new Date("2024-06-01"))).toBe(true);
  });

  it("WorkingHours / NoticePeriod / ProbationPeriod", () => {
    expect(WorkingHours.fullTime().hoursPerWeek).toBe(40);
    expect(() => WorkingHours.create(-1)).toThrow();
    expect(NoticePeriod.create(30).days).toBe(30);
    expect(ProbationPeriod.none().active).toBe(false);
  });

  it("PositionTitle", () => {
    expect(PositionTitle.create("  Producer  ").value).toBe("Producer");
    expect(
      PositionTitle.create("Audio Engineer").equals(
        PositionTitle.create("audio engineer"),
      ),
    ).toBe(true);
  });
});
