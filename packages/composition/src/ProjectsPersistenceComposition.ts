import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresDeliverableRepository,
  PostgresProjectDependencyRepository,
  PostgresProjectObjectiveRepository,
  PostgresProjectPhaseRepository,
  PostgresProjectRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const PROJECTS_REPOSITORY_KEYS = {
  project: "project",
  projectPhase: "projectPhase",
  projectObjective: "projectObjective",
  projectDependency: "projectDependency",
  deliverable: "deliverable",
} as const;

export function registerPostgresProjectsRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(PROJECTS_REPOSITORY_KEYS.project, new PostgresProjectRepository(database));
  composition.repositories.register(PROJECTS_REPOSITORY_KEYS.projectPhase, new PostgresProjectPhaseRepository(database));
  composition.repositories.register(
    PROJECTS_REPOSITORY_KEYS.projectObjective,
    new PostgresProjectObjectiveRepository(database),
  );
  composition.repositories.register(
    PROJECTS_REPOSITORY_KEYS.projectDependency,
    new PostgresProjectDependencyRepository(database),
  );
  composition.repositories.register(PROJECTS_REPOSITORY_KEYS.deliverable, new PostgresDeliverableRepository(database));
}
