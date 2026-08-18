import {
  Deliverable,
  Project,
  ProjectDependency,
  ProjectObjective,
  ProjectPhase,
  asDeliverableId,
  asProjectDependencyId,
  asProjectId,
  asProjectObjectiveId,
  asProjectPhaseId,
  type DeliverableSnapshot,
  type ProjectDependencySnapshot,
  type ProjectObjectiveSnapshot,
  type ProjectPhaseSnapshot,
  type ProjectSnapshot,
} from "@creative-lab/projects";
import type { InferSelectModel } from "drizzle-orm";
import type {
  deliverables,
  projectDependencies,
  projectObjectives,
  projectPhases,
  projects,
} from "./schema.js";

type ProjectRow = InferSelectModel<typeof projects>;
type ProjectPhaseRow = InferSelectModel<typeof projectPhases>;
type ProjectObjectiveRow = InferSelectModel<typeof projectObjectives>;
type ProjectDependencyRow = InferSelectModel<typeof projectDependencies>;
type DeliverableRow = InferSelectModel<typeof deliverables>;

export const ProjectMapper = {
  toRow(project: Project): ProjectRow {
    const s = project.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      name: s.name,
      description: s.description,
      projectType: s.projectType,
      priority: s.priority,
      status: s.status,
      ownerId: s.ownerId,
      startDate: s.startDate,
      targetEndDate: s.targetEndDate,
      actualEndDate: s.actualEndDate,
      budgetReference: s.budgetReference,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      closedAt: s.closedAt,
    };
  },
  fromRow(row: ProjectRow): Project {
    const snapshot: ProjectSnapshot = {
      id: asProjectId(row.id),
      organizationId: row.organizationId as ProjectSnapshot["organizationId"],
      name: row.name,
      description: row.description ?? null,
      projectType: row.projectType as ProjectSnapshot["projectType"],
      priority: row.priority as ProjectSnapshot["priority"],
      status: row.status as ProjectSnapshot["status"],
      ownerId: row.ownerId,
      startDate: row.startDate ? new Date(row.startDate) : null,
      targetEndDate: row.targetEndDate ? new Date(row.targetEndDate) : null,
      actualEndDate: row.actualEndDate ? new Date(row.actualEndDate) : null,
      budgetReference: row.budgetReference ?? null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      closedAt: row.closedAt ? new Date(row.closedAt) : null,
    };
    return Project.reconstitute(snapshot);
  },
};

export const ProjectPhaseMapper = {
  toRow(phase: ProjectPhase): ProjectPhaseRow {
    const s = phase.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      projectId: s.projectId,
      name: s.name,
      sequence: s.sequence,
      status: s.status,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: ProjectPhaseRow): ProjectPhase {
    const snapshot: ProjectPhaseSnapshot = {
      id: asProjectPhaseId(row.id),
      organizationId: row.organizationId as ProjectPhaseSnapshot["organizationId"],
      projectId: asProjectId(row.projectId),
      name: row.name,
      sequence: row.sequence,
      status: row.status as ProjectPhaseSnapshot["status"],
      startedAt: row.startedAt ? new Date(row.startedAt) : null,
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return ProjectPhase.reconstitute(snapshot);
  },
};

export const ProjectObjectiveMapper = {
  toRow(objective: ProjectObjective): ProjectObjectiveRow {
    const s = objective.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      projectId: s.projectId,
      name: s.name,
      description: s.description,
      status: s.status,
      targetValue: String(s.targetValue),
      currentValue: String(s.currentValue),
      completedAt: s.completedAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: ProjectObjectiveRow): ProjectObjective {
    const snapshot: ProjectObjectiveSnapshot = {
      id: asProjectObjectiveId(row.id),
      organizationId: row.organizationId as ProjectObjectiveSnapshot["organizationId"],
      projectId: asProjectId(row.projectId),
      name: row.name,
      description: row.description ?? null,
      status: row.status as ProjectObjectiveSnapshot["status"],
      targetValue: Number(row.targetValue),
      currentValue: Number(row.currentValue),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return ProjectObjective.reconstitute(snapshot);
  },
};

export const ProjectDependencyMapper = {
  toRow(dependency: ProjectDependency): ProjectDependencyRow {
    const s = dependency.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      projectId: s.projectId,
      dependsOnProjectId: s.dependsOnProjectId,
      dependencyType: s.dependencyType,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: ProjectDependencyRow): ProjectDependency {
    const snapshot: ProjectDependencySnapshot = {
      id: asProjectDependencyId(row.id),
      organizationId: row.organizationId as ProjectDependencySnapshot["organizationId"],
      projectId: asProjectId(row.projectId),
      dependsOnProjectId: asProjectId(row.dependsOnProjectId),
      dependencyType: row.dependencyType as ProjectDependencySnapshot["dependencyType"],
      status: row.status as ProjectDependencySnapshot["status"],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return ProjectDependency.reconstitute(snapshot);
  },
};

export const DeliverableMapper = {
  toRow(deliverable: Deliverable): DeliverableRow {
    const s = deliverable.toSnapshot();
    return {
      id: s.id,
      organizationId: s.organizationId,
      projectId: s.projectId,
      name: s.name,
      description: s.description,
      status: s.status,
      dueDate: s.dueDate,
      completedAt: s.completedAt,
      workOrderReferences: s.workOrderReferences as string[],
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
  fromRow(row: DeliverableRow): Deliverable {
    const snapshot: DeliverableSnapshot = {
      id: asDeliverableId(row.id),
      organizationId: row.organizationId as DeliverableSnapshot["organizationId"],
      projectId: asProjectId(row.projectId),
      name: row.name,
      description: row.description ?? null,
      status: row.status as DeliverableSnapshot["status"],
      dueDate: row.dueDate ? new Date(row.dueDate) : null,
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      workOrderReferences: row.workOrderReferences ?? [],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
    return Deliverable.reconstitute(snapshot);
  },
};
