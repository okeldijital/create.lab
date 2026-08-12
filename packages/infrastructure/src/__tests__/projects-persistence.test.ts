import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { OrganizationId } from "@creative-lab/organization";
import {
  Deliverable,
  Project,
  ProjectDependency,
  ProjectObjective,
  ProjectPhase,
  ProjectPriority,
  ProjectType,
  DependencyType,
} from "@creative-lab/projects";
import {
  DeliverableMapper,
  ProjectDependencyMapper,
  ProjectMapper,
  ProjectObjectiveMapper,
  ProjectPhaseMapper,
} from "../persistence/projects/mappers.js";

const id = (): string => randomUUID();
const organizationId = id() as OrganizationId;
const now = new Date("2026-01-01T00:00:00.000Z");

const project = Project.create({
  id: id(),
  organizationId,
  name: "Brand Refresh",
  description: "Q1 brand initiative",
  projectType: ProjectType.CLIENT,
  priority: ProjectPriority.HIGH,
  ownerId: "owner-worker-1",
  startDate: now,
  targetEndDate: new Date("2026-03-31T00:00:00.000Z"),
  budgetReference: "BUD-2026-001",
  now,
});

const phase = ProjectPhase.create({
  id: id(),
  organizationId,
  projectId: project.id,
  name: "Discovery",
  sequence: 1,
  now,
});

const objective = ProjectObjective.create({
  id: id(),
  organizationId,
  projectId: project.id,
  name: "Increase brand recognition",
  description: "Measured via survey",
  targetValue: 100,
  currentValue: 25,
  now,
});

const dependency = ProjectDependency.create({
  id: id(),
  organizationId,
  projectId: project.id,
  dependsOnProjectId: Project.create({
    id: id(),
    organizationId,
    name: "Website Redesign",
    ownerId: "owner-worker-2",
    now,
  }).id,
  dependencyType: DependencyType.BLOCKS,
  now,
});

const deliverable = Deliverable.create({
  id: id(),
  organizationId,
  projectId: project.id,
  name: "Brand Guidelines",
  description: "v1 guidelines PDF",
  dueDate: new Date("2026-02-15T00:00:00.000Z"),
  now,
});

describe("Projects persistence mappers", () => {
  it("round-trips Project", () => {
    const restored = ProjectMapper.fromRow(ProjectMapper.toRow(project));
    expect(restored.toSnapshot()).toEqual(project.toSnapshot());
  });

  it("round-trips ProjectPhase", () => {
    const restored = ProjectPhaseMapper.fromRow(ProjectPhaseMapper.toRow(phase));
    expect(restored.toSnapshot()).toEqual(phase.toSnapshot());
  });

  it("round-trips ProjectObjective", () => {
    const restored = ProjectObjectiveMapper.fromRow(ProjectObjectiveMapper.toRow(objective));
    expect(restored.toSnapshot()).toEqual(objective.toSnapshot());
  });

  it("round-trips ProjectDependency", () => {
    const restored = ProjectDependencyMapper.fromRow(ProjectDependencyMapper.toRow(dependency));
    expect(restored.toSnapshot()).toEqual(dependency.toSnapshot());
  });

  it("round-trips Deliverable", () => {
    const restored = DeliverableMapper.fromRow(DeliverableMapper.toRow(deliverable));
    expect(restored.toSnapshot()).toEqual(deliverable.toSnapshot());
  });
});
