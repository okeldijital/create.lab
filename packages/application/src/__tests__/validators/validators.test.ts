import { describe, expect, it } from "vitest";
import { createOrganizationCommand } from "../../commands/index.js";
import { ValidationError } from "../../errors/ApplicationErrors.js";
import { getProjectQuery } from "../../queries/index.js";
import {
  RequiredFieldsCommandValidator,
  RequiredFieldsQueryValidator,
  validateQueryRequired,
  validateRequired,
} from "../../validators/index.js";

describe("Validators", () => {
  it("validateRequired passes", () => {
    expect(() =>
      validateRequired(createOrganizationCommand({ name: "A" }), ["name"]),
    ).not.toThrow();
  });

  it("validateRequired fails on missing", () => {
    expect(() =>
      validateRequired(createOrganizationCommand({ name: "" }), ["name"]),
    ).toThrow(ValidationError);
  });

  it("RequiredFieldsCommandValidator", () => {
    const v = new RequiredFieldsCommandValidator([
      { field: "name", message: "Name needed" },
    ]);
    try {
      v.validate(createOrganizationCommand({ name: "" }));
      expect.fail("should throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors[0]?.message).toBe(
        "Name needed",
      );
    }
  });

  it("validateQueryRequired passes", () => {
    expect(() =>
      validateQueryRequired(getProjectQuery("p1"), ["projectId"]),
    ).not.toThrow();
  });

  it("validateQueryRequired fails", () => {
    expect(() =>
      validateQueryRequired(getProjectQuery(""), ["projectId"]),
    ).toThrow(ValidationError);
  });

  it("RequiredFieldsQueryValidator", () => {
    const v = new RequiredFieldsQueryValidator([{ field: "projectId" }]);
    expect(() => v.validate(getProjectQuery(""))).toThrow(ValidationError);
  });

  it("multiple missing fields", () => {
    const v = new RequiredFieldsCommandValidator([
      { field: "name" },
      { field: "slug" },
    ]);
    try {
      v.validate(createOrganizationCommand({ name: "" }));
      expect.fail("should throw");
    } catch (e) {
      expect((e as ValidationError).fieldErrors.length).toBeGreaterThanOrEqual(
        1,
      );
    }
  });
});
