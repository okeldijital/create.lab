import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresWorkIncidentRepository,
  PostgresWorkMilestoneRepository,
  PostgresWorkOrderRepository,
  PostgresWorkOutputRepository,
  PostgresWorkSessionRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const OPERATIONS_REPOSITORY_KEYS = {
  workOrder: "workOrder",
  workSession: "workSession",
  workMilestone: "workMilestone",
  workOutput: "workOutput",
  workIncident: "workIncident",
} as const;

export function registerPostgresOperationsRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(OPERATIONS_REPOSITORY_KEYS.workOrder, new PostgresWorkOrderRepository(database));
  composition.repositories.register(OPERATIONS_REPOSITORY_KEYS.workSession, new PostgresWorkSessionRepository(database));
  composition.repositories.register(
    OPERATIONS_REPOSITORY_KEYS.workMilestone,
    new PostgresWorkMilestoneRepository(database),
  );
  composition.repositories.register(OPERATIONS_REPOSITORY_KEYS.workOutput, new PostgresWorkOutputRepository(database));
  composition.repositories.register(
    OPERATIONS_REPOSITORY_KEYS.workIncident,
    new PostgresWorkIncidentRepository(database),
  );
}
