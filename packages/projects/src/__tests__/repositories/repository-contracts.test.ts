import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Deliverable } from "../../aggregates/Deliverable/Deliverable.js";
import { Project } from "../../aggregates/Project/Project.js";
import { ProjectDependency } from "../../aggregates/ProjectDependency/ProjectDependency.js";
import { ProjectObjective } from "../../aggregates/ProjectObjective/ProjectObjective.js";
import { ProjectPhase } from "../../aggregates/ProjectPhase/ProjectPhase.js";
import {
  InMemoryDeliverableRepository,
  InMemoryProjectDependencyRepository,
  InMemoryProjectObjectiveRepository,
  InMemoryProjectPhaseRepository,
  InMemoryProjectRepository,
} from "../helpers/in-memory.js";

const orgId = asOrganizationId("org-1");

describe("Repository contracts (in-memory ports)", () => {
  it("ProjectRepository finders and archive", async () => {
    const repo = new InMemoryProjectRepository();
    const project = Project.create({
      organizationId: orgId,
      name: "Album",
      ownerId: "owner-1",
    });
    await repo.save(project);
    expect(await repo.exists(project.id)).toBe(true);
    expect((await repo.findByOwner("owner-1"))[0]?.id).toBe(project.id);
    expect((await repo.findByOrganization(orgId)).length).toBe(1);
    expect((await repo.findActive()).length).toBe(1);
    await repo.archive(project.id);
    expect(await repo.findById(project.id)).toBeNull();
  });

  it("child repos scoped by project", async () => {
    const project = Project.create({
      organizationId: orgId,
      name: "Album",
      ownerId: "o1",
    });
    const other = Project.create({
      organizationId: orgId,
      name: "Other",
      ownerId: "o1",
      id: "other-id",
    });

    const phaseRepo = new InMemoryProjectPhaseRepository();
    await phaseRepo.save(
      ProjectPhase.create({
        organizationId: orgId,
        projectId: project.id,
        name: "Planning",
        sequence: 1,
      }),
    );
    expect((await phaseRepo.findByProject(project.id)).length).toBe(1);

    const delRepo = new InMemoryDeliverableRepository();
    await delRepo.save(
      Deliverable.create({
        organizationId: orgId,
        projectId: project.id,
        name: "Master",
      }),
    );
    expect((await delRepo.findActive()).length).toBe(1);

    const depRepo = new InMemoryProjectDependencyRepository();
    await depRepo.save(
      ProjectDependency.create({
        organizationId: orgId,
        projectId: project.id,
        dependsOnProjectId: other.id,
      }),
    );
    expect((await depRepo.findByProject(project.id)).length).toBe(1);
    expect((await depRepo.findDependingOn(other.id)).length).toBe(1);

    const objRepo = new InMemoryProjectObjectiveRepository();
    await objRepo.save(
      ProjectObjective.create({
        organizationId: orgId,
        projectId: project.id,
        name: "Release",
      }),
    );
    expect((await objRepo.findByProject(project.id)).length).toBe(1);
  });
});
