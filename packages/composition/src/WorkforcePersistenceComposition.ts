import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresEmploymentContractRepository,
  PostgresEmploymentRepository,
  PostgresPositionRepository,
  PostgresReportingRelationshipRepository,
  PostgresWorkerRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const WORKFORCE_REPOSITORY_KEYS = {
  worker: "worker",
  position: "position",
  employment: "employment",
  employmentContract: "employmentContract",
  reportingRelationship: "reportingRelationship",
} as const;

export function registerPostgresWorkforceRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(WORKFORCE_REPOSITORY_KEYS.worker, new PostgresWorkerRepository(database));
  composition.repositories.register(WORKFORCE_REPOSITORY_KEYS.position, new PostgresPositionRepository(database));
  composition.repositories.register(WORKFORCE_REPOSITORY_KEYS.employment, new PostgresEmploymentRepository(database));
  composition.repositories.register(WORKFORCE_REPOSITORY_KEYS.employmentContract, new PostgresEmploymentContractRepository(database));
  composition.repositories.register(WORKFORCE_REPOSITORY_KEYS.reportingRelationship, new PostgresReportingRelationshipRepository(database));
}
