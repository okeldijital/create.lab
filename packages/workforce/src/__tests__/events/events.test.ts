import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import {
  DOMAIN_EVENT_VERSION,
  WorkerCreated,
  ManagerAssigned,
} from "../../events/index.js";
import { EmploymentType } from "../../enums/EmploymentType.js";
import { WorkerStatus } from "../../enums/WorkerStatus.js";
import { asReportingRelationshipId, asWorkerId } from "../../types/ids.js";

describe("Workforce domain events", () => {
  it("are frozen and versioned", () => {
    const event = WorkerCreated.create({
      organizationId: asOrganizationId("org-1"),
      workerId: asWorkerId("w1"),
      employeeNumber: "E1",
      email: "a@b.com",
      status: WorkerStatus.ACTIVE,
      employmentType: EmploymentType.FULL_TIME,
    });
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(event.eventVersion).toBe(DOMAIN_EVENT_VERSION);
  });

  it("manager assigned carries ids", () => {
    const event = ManagerAssigned.create({
      organizationId: asOrganizationId("org-1"),
      workerId: asWorkerId("w1"),
      managerId: asWorkerId("m1"),
      relationshipId: asReportingRelationshipId("r1"),
    });
    expect(event.payload.managerId).toBe("m1");
  });
});
