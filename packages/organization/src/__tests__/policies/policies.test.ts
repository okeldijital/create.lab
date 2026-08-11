import { describe, expect, it } from "vitest";
import { Organization } from "../../aggregates/Organization/Organization.js";
import { Studio } from "../../aggregates/Studio/Studio.js";
import { OrganizationStatus } from "../../enums/OrganizationStatus.js";
import { StudioStatus } from "../../enums/StudioStatus.js";
import { StudioType } from "../../enums/StudioType.js";
import { DepartmentHierarchyError } from "../../errors/DepartmentErrors.js";
import {
  InvalidOrganizationStatusTransitionError,
  OrganizationArchivedError,
} from "../../errors/OrganizationErrors.js";
import { StudioValidationError } from "../../errors/StudioErrors.js";
import {
  DepartmentHierarchyPolicy,
  OrganizationActivationPolicy,
  StudioAvailabilityPolicy,
} from "../../policies/index.js";
import {
  asDepartmentId,
  asOrganizationId,
} from "../../types/ids.js";

describe("DepartmentHierarchyPolicy", () => {
  const org = asOrganizationId("org-1");
  const a = asDepartmentId("a");
  const b = asDepartmentId("b");
  const c = asDepartmentId("c");

  it("allows root departments", () => {
    expect(() =>
      DepartmentHierarchyPolicy.assertValidParent({
        departmentId: a,
        organizationId: org,
        parentDepartmentId: null,
        departments: [],
      }),
    ).not.toThrow();
  });

  it("rejects parent from another organization", () => {
    expect(() =>
      DepartmentHierarchyPolicy.assertValidParent({
        departmentId: a,
        organizationId: org,
        parentDepartmentId: b,
        departments: [
          {
            id: b,
            organizationId: asOrganizationId("other"),
            parentDepartmentId: null,
          },
        ],
      }),
    ).toThrow(DepartmentHierarchyError);
  });

  it("rejects circular hierarchy", () => {
    // a → b → c; setting c's parent to a is fine; setting a's parent to c cycles
    const departments = [
      { id: a, organizationId: org, parentDepartmentId: null },
      { id: b, organizationId: org, parentDepartmentId: a },
      { id: c, organizationId: org, parentDepartmentId: b },
    ];
    expect(() =>
      DepartmentHierarchyPolicy.assertValidParent({
        departmentId: a,
        organizationId: org,
        parentDepartmentId: c,
        departments,
      }),
    ).toThrow(DepartmentHierarchyError);
  });

  it("enforces max depth", () => {
    const departments = [
      { id: a, organizationId: org, parentDepartmentId: null },
      { id: b, organizationId: org, parentDepartmentId: a },
    ];
    expect(() =>
      DepartmentHierarchyPolicy.assertWithinDepth({
        departmentId: c,
        parentDepartmentId: b,
        departments,
        maxDepth: 2,
      }),
    ).toThrow(DepartmentHierarchyError);
  });
});

describe("OrganizationActivationPolicy", () => {
  it("allows activate from suspended", () => {
    const org = Organization.create({ name: "Acme" });
    org.changeStatus(OrganizationStatus.SUSPENDED);
    expect(() =>
      OrganizationActivationPolicy.assertCanActivate(org),
    ).not.toThrow();
  });

  it("blocks activate from archived", () => {
    const org = Organization.create({ name: "Acme" });
    org.archive();
    expect(() => OrganizationActivationPolicy.assertCanActivate(org)).toThrow(
      OrganizationArchivedError,
    );
  });

  it("blocks suspend from inactive", () => {
    const org = Organization.create({ name: "Acme" });
    org.changeStatus(OrganizationStatus.INACTIVE);
    expect(() => OrganizationActivationPolicy.assertCanSuspend(org)).toThrow(
      InvalidOrganizationStatusTransitionError,
    );
  });

  it("assertOperational requires ACTIVE", () => {
    const org = Organization.create({ name: "Acme" });
    org.changeStatus(OrganizationStatus.INACTIVE);
    expect(() => OrganizationActivationPolicy.assertOperational(org)).toThrow();
  });
});

describe("StudioAvailabilityPolicy", () => {
  const orgId = asOrganizationId("org-1");

  it("detects available studios", () => {
    const studio = Studio.create({
      organizationId: orgId,
      name: "A",
      type: StudioType.PHYSICAL,
      capacity: 4,
    });
    expect(StudioAvailabilityPolicy.isAvailable(studio)).toBe(true);
    expect(() => StudioAvailabilityPolicy.assertAvailable(studio)).not.toThrow();
  });

  it("rejects maintenance studios", () => {
    const studio = Studio.create({
      organizationId: orgId,
      name: "A",
      type: StudioType.PHYSICAL,
      capacity: 4,
    });
    studio.update({ status: StudioStatus.MAINTENANCE });
    expect(() => StudioAvailabilityPolicy.assertAvailable(studio)).toThrow(
      StudioValidationError,
    );
  });

  it("checks required capacity", () => {
    const studio = Studio.create({
      organizationId: orgId,
      name: "A",
      type: StudioType.PHYSICAL,
      capacity: 2,
    });
    expect(() =>
      StudioAvailabilityPolicy.assertCapacitySufficient(studio, 3),
    ).toThrow(StudioValidationError);
    expect(() =>
      StudioAvailabilityPolicy.assertCapacitySufficient(studio, 2),
    ).not.toThrow();
  });
});
