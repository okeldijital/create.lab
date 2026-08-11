import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { Deliverable } from "../../aggregates/Deliverable/Deliverable.js";
import { Project } from "../../aggregates/Project/Project.js";
import { ProjectDependency } from "../../aggregates/ProjectDependency/ProjectDependency.js";
import { ProjectObjective } from "../../aggregates/ProjectObjective/ProjectObjective.js";
import { ProjectPhase } from "../../aggregates/ProjectPhase/ProjectPhase.js";
import { DeliverableStatus } from "../../enums/DeliverableStatus.js";
import { ObjectiveStatus } from "../../enums/ObjectiveStatus.js";
import { PhaseStatus } from "../../enums/PhaseStatus.js";
import { ProjectStatus } from "../../enums/ProjectStatus.js";
import { ProjectType } from "../../enums/ProjectType.js";
import {
  InvalidProjectStateError,
  ObjectiveAlreadyCompletedError,
  PhaseSequenceError,
  SelfDependencyError,
} from "../../errors/ProjectErrors.js";
import {
  DeliverableCompleted,
  DeliverableCreated,
  DependencyCreated,
  ObjectiveAchieved,
  PhaseCompleted,
  PhaseStarted,
  ProjectClosed,
  ProjectCompleted,
  ProjectCreated,
  ProjectStarted,
} from "../../events/project-events.js";

const orgId = asOrganizationId("org-1");

function createProject(
  overrides: Partial<Parameters<typeof Project.create>[0]> = {},
) {
  return Project.create({
    organizationId: orgId,
    name: "Album Production",
    ownerId: "owner-1",
    projectType: ProjectType.CLIENT,
    ...overrides,
  });
}

describe("Project lifecycle", () => {
  it("creates in CREATED with event", () => {
    const p = createProject();
    expect(p.status).toBe(ProjectStatus.CREATED);
    expect(p.ownerId).toBe("owner-1");
    expect(p.pullDomainEvents()[0]).toBeInstanceOf(ProjectCreated);
  });

  it("follows CREATED → PLANNING → ACTIVE → COMPLETED → CLOSED", () => {
    const p = createProject();
    p.pullDomainEvents();
    p.plan();
    expect(p.status).toBe(ProjectStatus.PLANNING);
    p.start(new Date("2026-08-01T09:00:00Z"));
    expect(p.status).toBe(ProjectStatus.ACTIVE);
    expect(p.pullDomainEvents().some((e) => e instanceof ProjectStarted)).toBe(
      true,
    );
    p.complete(new Date("2026-09-01T09:00:00Z"));
    expect(p.status).toBe(ProjectStatus.COMPLETED);
    expect(
      p.pullDomainEvents().some((e) => e instanceof ProjectCompleted),
    ).toBe(true);
    p.close();
    expect(p.status).toBe(ProjectStatus.CLOSED);
    expect(p.pullDomainEvents().some((e) => e instanceof ProjectClosed)).toBe(
      true,
    );
  });

  it("closed projects are immutable", () => {
    const p = createProject();
    p.start();
    p.complete(new Date(Date.now() + 1000));
    p.close();
    expect(() => p.start()).toThrow(InvalidProjectStateError);
    expect(() => p.updateDetails({ name: "X" })).toThrow(
      InvalidProjectStateError,
    );
  });

  it("requires owner", () => {
    expect(() => createProject({ ownerId: "  " })).toThrow(
      InvalidProjectStateError,
    );
  });

  it("rejects actualEnd before startDate", () => {
    const p = createProject({
      startDate: new Date("2026-08-10T00:00:00Z"),
    });
    p.start(new Date("2026-08-10T00:00:00Z"));
    expect(() => p.complete(new Date("2026-08-01T00:00:00Z"))).toThrow(
      InvalidProjectStateError,
    );
  });
});

describe("ProjectPhase", () => {
  it("starts and completes", () => {
    const p = createProject();
    const phase = ProjectPhase.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Production",
      sequence: 1,
    });
    expect(phase.status).toBe(PhaseStatus.PENDING);
    phase.start();
    expect(phase.status).toBe(PhaseStatus.ACTIVE);
    expect(phase.pullDomainEvents()[0]).toBeInstanceOf(PhaseStarted);
    phase.complete();
    expect(phase.status).toBe(PhaseStatus.COMPLETED);
    expect(phase.pullDomainEvents()[0]).toBeInstanceOf(PhaseCompleted);
    expect(() => phase.complete()).toThrow(PhaseSequenceError);
  });
});

describe("Deliverable", () => {
  it("references work orders and completes immutably", () => {
    const p = createProject();
    const wo = asWorkOrderId("wo-1");
    const d = Deliverable.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Mastered Album",
      workOrderReferences: [wo],
    });
    expect(d.status).toBe(DeliverableStatus.PLANNED);
    expect(d.workOrderReferences).toContain(wo);
    expect(d.pullDomainEvents()[0]).toBeInstanceOf(DeliverableCreated);
    d.linkWorkOrder(asWorkOrderId("wo-2"));
    expect(d.workOrderReferences).toHaveLength(2);
    d.complete();
    expect(d.status).toBe(DeliverableStatus.DELIVERED);
    expect(d.pullDomainEvents().some((e) => e instanceof DeliverableCompleted)).toBe(
      true,
    );
    expect(() => d.linkWorkOrder(asWorkOrderId("wo-3"))).toThrow(
      InvalidProjectStateError,
    );
  });
});

describe("ProjectDependency", () => {
  it("prohibits self dependency", () => {
    const p = createProject();
    expect(() =>
      ProjectDependency.create({
        organizationId: orgId,
        projectId: p.id,
        dependsOnProjectId: p.id,
      }),
    ).toThrow(SelfDependencyError);
  });

  it("creates ACTIVE dependency with event", () => {
    const a = createProject({ name: "Website", id: "proj-a" });
    const b = createProject({ name: "Branding", id: "proj-b" });
    const dep = ProjectDependency.create({
      organizationId: orgId,
      projectId: a.id,
      dependsOnProjectId: b.id,
    });
    expect(dep.pullDomainEvents()[0]).toBeInstanceOf(DependencyCreated);
  });
});

describe("ProjectObjective", () => {
  it("tracks progress and becomes immutable after achieve", () => {
    const p = createProject();
    const obj = ProjectObjective.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Produce 12 Tracks",
      targetValue: 12,
      currentValue: 0,
    });
    expect(obj.status).toBe(ObjectiveStatus.NOT_STARTED);
    obj.updateProgress(6);
    expect(obj.status).toBe(ObjectiveStatus.IN_PROGRESS);
    expect(obj.progress.value).toBe(50);
    obj.achieve();
    expect(obj.status).toBe(ObjectiveStatus.ACHIEVED);
    expect(obj.pullDomainEvents()[0]).toBeInstanceOf(ObjectiveAchieved);
    expect(() => obj.updateProgress(10)).toThrow(
      ObjectiveAlreadyCompletedError,
    );
  });
});
