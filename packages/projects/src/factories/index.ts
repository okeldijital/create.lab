import {
  Project,
  type CreateProjectProps,
} from "../aggregates/Project/Project.js";
import {
  ProjectPhase,
  type CreateProjectPhaseProps,
} from "../aggregates/ProjectPhase/ProjectPhase.js";
import {
  Deliverable,
  type CreateDeliverableProps,
} from "../aggregates/Deliverable/Deliverable.js";
import {
  ProjectDependency,
  type CreateProjectDependencyProps,
} from "../aggregates/ProjectDependency/ProjectDependency.js";
import {
  ProjectObjective,
  type CreateProjectObjectiveProps,
} from "../aggregates/ProjectObjective/ProjectObjective.js";

export const ProjectFactory = {
  create: (props: CreateProjectProps) => Project.create(props),
  reconstitute: Project.reconstitute.bind(Project),
};

export const ProjectPhaseFactory = {
  create: (props: CreateProjectPhaseProps) => ProjectPhase.create(props),
  reconstitute: ProjectPhase.reconstitute.bind(ProjectPhase),
};

export const DeliverableFactory = {
  create: (props: CreateDeliverableProps) => Deliverable.create(props),
  reconstitute: Deliverable.reconstitute.bind(Deliverable),
};

export const ProjectDependencyFactory = {
  create: (props: CreateProjectDependencyProps) =>
    ProjectDependency.create(props),
  reconstitute: ProjectDependency.reconstitute.bind(ProjectDependency),
};

export const ProjectObjectiveFactory = {
  create: (props: CreateProjectObjectiveProps) =>
    ProjectObjective.create(props),
  reconstitute: ProjectObjective.reconstitute.bind(ProjectObjective),
};
