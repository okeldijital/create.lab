import { describe, expect, it } from "vitest";
import {
  asDepartmentId,
  asOrganizationId,
} from "@creative-lab/organization";
import { Worker } from "../../aggregates/Worker/Worker.js";
import { EmploymentType } from "../../enums/EmploymentType.js";
import { WorkerStatus } from "../../enums/WorkerStatus.js";
import {
  WorkerArchivedError,
  WorkerValidationError,
} from "../../errors/WorkforceErrors.js";
import { WorkerCreated, WorkerArchived } from "../../events/worker-events.js";
import { asWorkerId } from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const deptId = asDepartmentId("dept-1");

function createWorker(overrides: Partial<Parameters<typeof Worker.create>[0]> = {}) {
  return Worker.create({
    organizationId: orgId,
    employeeNumber: "E001",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    employmentType: EmploymentType.FULL_TIME,
    departmentId: deptId,
    ...overrides,
  });
}

describe("Worker aggregate", () => {
  it("creates with ACTIVE status and event", () => {
    const worker = createWorker();
    expect(worker.status).toBe(WorkerStatus.ACTIVE);
    expect(worker.departmentId).toBe(deptId);
    expect(worker.pullDomainEvents()[0]).toBeInstanceOf(WorkerCreated);
  });

  it("requires department", () => {
    expect(() =>
      createWorker({ departmentId: undefined as never }),
    ).toThrow(WorkerValidationError);
  });

  it("cannot self-manage", () => {
    const id = asWorkerId("w1");
    expect(() =>
      createWorker({ id, managerId: id }),
    ).toThrow(WorkerValidationError);
  });

  it("archives and blocks updates", () => {
    const worker = createWorker();
    worker.pullDomainEvents();
    worker.archive();
    expect(worker.isArchived).toBe(true);
    expect(worker.pullDomainEvents()[0]).toBeInstanceOf(WorkerArchived);
    expect(() => worker.update({ firstName: "X" })).toThrow(WorkerArchivedError);
  });

  it("status transitions", () => {
    const worker = createWorker();
    worker.changeStatus(WorkerStatus.ON_LEAVE);
    expect(worker.status).toBe(WorkerStatus.ON_LEAVE);
    worker.changeStatus(WorkerStatus.ACTIVE);
    expect(worker.status).toBe(WorkerStatus.ACTIVE);
  });

  it("reconstitutes without events", () => {
    const worker = createWorker();
    const restored = Worker.reconstitute(worker.toSnapshot());
    expect(restored.id).toBe(worker.id);
    expect(restored.pullDomainEvents()).toHaveLength(0);
  });
});
