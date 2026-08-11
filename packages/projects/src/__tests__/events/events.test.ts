import { describe, expect, it } from "vitest";
import { DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import { asOrganizationId } from "@creative-lab/organization";
import { DeliverableStatus } from "../../enums/DeliverableStatus.js";
import { DependencyType } from "../../enums/DependencyType.js";
import { ProjectStatus } from "../../enums/ProjectStatus.js";
import {
  DependencyCreated,
  DeliverableCompleted,
  DeliverableCreated,
  ObjectiveAchieved,
  PhaseCompleted,
  PhaseStarted,
  ProjectClosed,
  ProjectCompleted,
  ProjectCreated,
  ProjectStarted,
} from "../../events/project-events.js";
import {
  asDeliverableId,
  asProjectDependencyId,
  asProjectId,
  asProjectObjectiveId,
  asProjectPhaseId,
} from "../../types/ids.js";

const orgId = asOrganizationId("org-1");
const projectId = asProjectId("proj-1");

describe("Domain events", () => {
  it("are immutable and versioned", () => {
    const event = ProjectCreated.create({
      organizationId: orgId,
      projectId,
      name: "Album",
      status: ProjectStatus.CREATED,
      ownerId: "o1",
    });
    expect(event.eventType).toBe("ProjectCreated");
    expect(event.eventVersion).toBe(DOMAIN_EVENT_VERSION);
    expect(Object.isFrozen(event)).toBe(true);
  });

  it("covers minimum event set", () => {
    const events = [
      ProjectStarted.create({ organizationId: orgId, projectId }),
      ProjectCompleted.create({
        organizationId: orgId,
        projectId,
        actualEndDate: new Date(),
      }),
      ProjectClosed.create({
        organizationId: orgId,
        projectId,
        closedAt: new Date(),
      }),
      PhaseStarted.create({
        organizationId: orgId,
        phaseId: asProjectPhaseId("ph1"),
        projectId,
        name: "Production",
      }),
      PhaseCompleted.create({
        organizationId: orgId,
        phaseId: asProjectPhaseId("ph1"),
        projectId,
        name: "Production",
      }),
      DeliverableCreated.create({
        organizationId: orgId,
        deliverableId: asDeliverableId("d1"),
        projectId,
        name: "Master",
        status: DeliverableStatus.PLANNED,
      }),
      DeliverableCompleted.create({
        organizationId: orgId,
        deliverableId: asDeliverableId("d1"),
        projectId,
        name: "Master",
      }),
      ObjectiveAchieved.create({
        organizationId: orgId,
        objectiveId: asProjectObjectiveId("obj1"),
        projectId,
        name: "Release",
      }),
      DependencyCreated.create({
        organizationId: orgId,
        dependencyId: asProjectDependencyId("dep1"),
        projectId,
        dependsOnProjectId: asProjectId("proj-2"),
        dependencyType: DependencyType.BLOCKS,
      }),
    ];
    for (const e of events) {
      expect(e.eventVersion).toBe(DOMAIN_EVENT_VERSION);
      expect(e.organizationId).toBe(orgId);
    }
  });
});
