import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Worker } from "../../aggregates/Worker/Worker.js";
import { EmploymentType } from "../../enums/EmploymentType.js";
import {
  InvalidManagerAssignmentError,
  ReportingHierarchyError,
  EmploymentConflictError,
} from "../../errors/WorkforceErrors.js";
import {
  EmploymentLifecyclePolicy,
  ReportingHierarchyPolicy,
} from "../../policies/index.js";
import { asDepartmentId } from "@creative-lab/organization";
import { asWorkerId } from "../../types/ids.js";
import { WorkerStatus } from "../../enums/WorkerStatus.js";

const org = asOrganizationId("org-1");
const dept = asDepartmentId("dept-1");

describe("ReportingHierarchyPolicy", () => {
  const a = asWorkerId("a");
  const b = asWorkerId("b");
  const c = asWorkerId("c");

  it("rejects self management", () => {
    expect(() =>
      ReportingHierarchyPolicy.assertValidAssignment({
        workerId: a,
        managerId: a,
        organizationId: org,
        nodes: [],
      }),
    ).toThrow(InvalidManagerAssignmentError);
  });

  it("rejects cycles", () => {
    // a → b → c; assigning a as manager of c is fine; a managed by c cycles
    const nodes = [
      { workerId: a, managerId: null, organizationId: org },
      { workerId: b, managerId: a, organizationId: org },
      { workerId: c, managerId: b, organizationId: org },
    ];
    expect(() =>
      ReportingHierarchyPolicy.assertValidAssignment({
        workerId: a,
        managerId: c,
        organizationId: org,
        nodes,
      }),
    ).toThrow(ReportingHierarchyError);
  });

  it("allows valid chain", () => {
    expect(() =>
      ReportingHierarchyPolicy.assertValidAssignment({
        workerId: c,
        managerId: b,
        organizationId: org,
        nodes: [
          { workerId: a, managerId: null, organizationId: org },
          { workerId: b, managerId: a, organizationId: org },
        ],
      }),
    ).not.toThrow();
  });
});

describe("EmploymentLifecyclePolicy", () => {
  it("blocks employment for archived worker", () => {
    const worker = Worker.create({
      organizationId: org,
      employeeNumber: "E1",
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      employmentType: EmploymentType.FULL_TIME,
      departmentId: dept,
    });
    worker.archive();
    expect(() =>
      EmploymentLifecyclePolicy.assertCanStartEmployment(worker),
    ).toThrow();
  });

  it("blocks second active employment", () => {
    const fake = { id: "e1" } as never;
    expect(() =>
      EmploymentLifecyclePolicy.assertNoActiveEmployment(fake),
    ).toThrow(EmploymentConflictError);
  });

  it("blocks terminated workers", () => {
    const worker = Worker.create({
      organizationId: org,
      employeeNumber: "E2",
      firstName: "A",
      lastName: "B",
      email: "c@d.com",
      employmentType: EmploymentType.FULL_TIME,
      departmentId: dept,
    });
    worker.changeStatus(WorkerStatus.TERMINATED);
    expect(() =>
      EmploymentLifecyclePolicy.assertCanStartEmployment(worker),
    ).toThrow(EmploymentConflictError);
  });
});
