import { describe, expect, it, beforeEach } from "vitest";
import { Organization, asOrganizationId } from "@creative-lab/organization";
import { asWorkOrderId } from "@creative-lab/operations";
import { DeliverableStatus } from "../../enums/DeliverableStatus.js";
import { ObjectiveStatus } from "../../enums/ObjectiveStatus.js";
import { PhaseStatus } from "../../enums/PhaseStatus.js";
import { ProjectStatus } from "../../enums/ProjectStatus.js";
import {
  DependencyCycleError,
  DuplicateDeliverableError,
  DuplicateProjectError,
  PhaseSequenceError,
  ProjectNotFoundError,
} from "../../errors/ProjectErrors.js";
import {
  DeliverableCompleted,
  DependencyCreated,
  ObjectiveAchieved,
  PhaseCompleted,
  PhaseStarted,
  ProjectClosed,
  ProjectCompleted,
  ProjectCreated,
  ProjectStarted,
} from "../../events/project-events.js";
import { DeliverableService } from "../../services/DeliverableService.js";
import { DependencyService } from "../../services/DependencyService.js";
import { ObjectiveService } from "../../services/ObjectiveService.js";
import { PhaseService } from "../../services/PhaseService.js";
import { ProjectService } from "../../services/ProjectService.js";
import {
  InMemoryDeliverableRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryProjectDependencyRepository,
  InMemoryProjectObjectiveRepository,
  InMemoryProjectPhaseRepository,
  InMemoryProjectRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("Project services", () => {
  let orgs: InMemoryOrganizationRepository;
  let projects: InMemoryProjectRepository;
  let phases: InMemoryProjectPhaseRepository;
  let deliverables: InMemoryDeliverableRepository;
  let dependencies: InMemoryProjectDependencyRepository;
  let objectives: InMemoryProjectObjectiveRepository;
  let events: InMemoryEventPublisher;
  let projectService: ProjectService;
  let phaseService: PhaseService;
  let deliverableService: DeliverableService;
  let dependencyService: DependencyService;
  let objectiveService: ObjectiveService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    projects = new InMemoryProjectRepository();
    phases = new InMemoryProjectPhaseRepository();
    deliverables = new InMemoryDeliverableRepository();
    dependencies = new InMemoryProjectDependencyRepository();
    objectives = new InMemoryProjectObjectiveRepository();
    events = new InMemoryEventPublisher();

    await orgs.save(
      Organization.create({
        name: "Studio One",
        slug: "studio-one",
        id: orgId,
      }),
    );

    projectService = new ProjectService({
      projectRepository: projects,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    phaseService = new PhaseService({
      projectPhaseRepository: phases,
      projectRepository: projects,
      eventPublisher: events,
    });
    deliverableService = new DeliverableService({
      deliverableRepository: deliverables,
      projectRepository: projects,
      eventPublisher: events,
    });
    dependencyService = new DependencyService({
      projectDependencyRepository: dependencies,
      projectRepository: projects,
      eventPublisher: events,
    });
    objectiveService = new ObjectiveService({
      projectObjectiveRepository: objectives,
      projectRepository: projects,
      eventPublisher: events,
    });
  });

  it("orchestrates project lifecycle with events", async () => {
    const p = await projectService.create({
      organizationId: orgId,
      name: "Album Production",
      ownerId: "owner-1",
    });
    expect(events.events.some((e) => e instanceof ProjectCreated)).toBe(true);
    await projectService.plan(p.id);
    await projectService.start(p.id);
    expect(events.events.some((e) => e instanceof ProjectStarted)).toBe(true);
    await projectService.complete(p.id, new Date(Date.now() + 1000));
    expect(events.events.some((e) => e instanceof ProjectCompleted)).toBe(true);
    await projectService.close(p.id);
    expect(events.events.some((e) => e instanceof ProjectClosed)).toBe(true);
    const closed = await projectService.getById(p.id);
    expect(closed.status).toBe(ProjectStatus.CLOSED);
  });

  it("rejects duplicate project names", async () => {
    await projectService.create({
      organizationId: orgId,
      name: "Website Redesign",
      ownerId: "o1",
    });
    await expect(
      projectService.create({
        organizationId: orgId,
        name: "website redesign",
        ownerId: "o1",
      }),
    ).rejects.toThrow(DuplicateProjectError);
  });

  it("enforces phase sequencing and single active", async () => {
    const p = await projectService.create({
      organizationId: orgId,
      name: "Campaign",
      ownerId: "o1",
    });
    await projectService.start(p.id);

    const ph1 = await phaseService.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Planning",
      sequence: 1,
    });
    await expect(
      phaseService.create({
        organizationId: orgId,
        projectId: p.id,
        name: "Launch",
        sequence: 3,
      }),
    ).rejects.toThrow(PhaseSequenceError);

    const ph2 = await phaseService.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Production",
      sequence: 2,
    });

    await phaseService.start(ph1.id);
    expect(events.events.some((e) => e instanceof PhaseStarted)).toBe(true);
    await expect(phaseService.start(ph2.id)).rejects.toThrow(PhaseSequenceError);

    await phaseService.complete(ph1.id);
    expect(events.events.some((e) => e instanceof PhaseCompleted)).toBe(true);
    await phaseService.start(ph2.id);
    const active = await phaseService.listByProject(p.id);
    expect(active.find((x) => x.id === ph2.id)?.status).toBe(PhaseStatus.ACTIVE);
  });

  it("enforces deliverable uniqueness and work order refs", async () => {
    const p = await projectService.create({
      organizationId: orgId,
      name: "Product Launch",
      ownerId: "o1",
    });
    await projectService.start(p.id);

    const d = await deliverableService.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Marketing Assets",
    });
    await expect(
      deliverableService.create({
        organizationId: orgId,
        projectId: p.id,
        name: "marketing assets",
      }),
    ).rejects.toThrow(DuplicateDeliverableError);

    await deliverableService.linkWorkOrder(d.id, asWorkOrderId("wo-99"));
    await deliverableService.complete(d.id);
    expect(events.events.some((e) => e instanceof DeliverableCompleted)).toBe(
      true,
    );
    const done = await deliverableService.getById(d.id);
    expect(done.status).toBe(DeliverableStatus.DELIVERED);
    expect(done.workOrderReferences.map(String)).toContain("wo-99");
  });

  it("detects dependency cycles", async () => {
    const a = await projectService.create({
      organizationId: orgId,
      name: "Website",
      ownerId: "o1",
    });
    const b = await projectService.create({
      organizationId: orgId,
      name: "Branding",
      ownerId: "o1",
    });
    await projectService.start(a.id);
    await projectService.start(b.id);

    await dependencyService.create({
      organizationId: orgId,
      projectId: a.id,
      dependsOnProjectId: b.id,
    });
    expect(events.events.some((e) => e instanceof DependencyCreated)).toBe(
      true,
    );

    await expect(
      dependencyService.create({
        organizationId: orgId,
        projectId: b.id,
        dependsOnProjectId: a.id,
      }),
    ).rejects.toThrow(DependencyCycleError);
  });

  it("tracks objectives to achievement", async () => {
    const p = await projectService.create({
      organizationId: orgId,
      name: "Artist Dev",
      ownerId: "o1",
    });
    await projectService.start(p.id);
    const obj = await objectiveService.create({
      organizationId: orgId,
      projectId: p.id,
      name: "Release Album",
      targetValue: 100,
    });
    await objectiveService.updateProgress(obj.id, 50);
    let mid = await objectiveService.getById(obj.id);
    expect(mid.status).toBe(ObjectiveStatus.IN_PROGRESS);
    await objectiveService.achieve(obj.id);
    expect(events.events.some((e) => e instanceof ObjectiveAchieved)).toBe(
      true,
    );
    mid = await objectiveService.getById(obj.id);
    expect(mid.status).toBe(ObjectiveStatus.ACHIEVED);
  });

  it("throws ProjectNotFoundError", async () => {
    await expect(projectService.getById("missing" as never)).rejects.toThrow(
      ProjectNotFoundError,
    );
  });
});
