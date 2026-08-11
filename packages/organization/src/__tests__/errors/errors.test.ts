import { describe, expect, it } from "vitest";
import {
  DomainError,
  DuplicateOrganizationSlugError,
  OrganizationNotFoundError,
  InvalidStudioCapacityError,
  DepartmentHierarchyError,
} from "../../errors/index.js";

describe("Domain errors", () => {
  it("expose stable codes", () => {
    expect(new OrganizationNotFoundError("x").code).toBe(
      "ORGANIZATION_NOT_FOUND",
    );
    expect(new DuplicateOrganizationSlugError("acme").code).toBe(
      "DUPLICATE_ORGANIZATION_SLUG",
    );
    expect(new InvalidStudioCapacityError(-1).code).toBe(
      "INVALID_STUDIO_CAPACITY",
    );
    expect(new DepartmentHierarchyError("cycle").code).toBe(
      "DEPARTMENT_HIERARCHY",
    );
  });

  it("extend DomainError", () => {
    const err = new OrganizationNotFoundError("x");
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("OrganizationNotFoundError");
  });
});
