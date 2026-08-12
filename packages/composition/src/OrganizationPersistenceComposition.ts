import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresOrganizationRepository,
  PostgresDepartmentRepository,
  PostgresTeamRepository,
  PostgresStudioRepository,
  PostgresOrganizationSettingsRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const ORGANIZATION_REPOSITORY_KEYS = {
  organization: "organization",
  department: "department",
  team: "team",
  studio: "studio",
  settings: "organization-settings",
} as const;

/**
 * Bind the EPIC-201 PostgreSQL repositories to the composition registry.
 * The same Drizzle database instance must be supplied by the caller when a
 * repository is used inside a PostgresUnitOfWork so all operations share the
 * transaction connection.
 */
export function registerPostgresOrganizationRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(
    ORGANIZATION_REPOSITORY_KEYS.organization,
    new PostgresOrganizationRepository(database),
  );
  composition.repositories.register(
    ORGANIZATION_REPOSITORY_KEYS.department,
    new PostgresDepartmentRepository(database),
  );
  composition.repositories.register(
    ORGANIZATION_REPOSITORY_KEYS.team,
    new PostgresTeamRepository(database),
  );
  composition.repositories.register(
    ORGANIZATION_REPOSITORY_KEYS.studio,
    new PostgresStudioRepository(database),
  );
  composition.repositories.register(
    ORGANIZATION_REPOSITORY_KEYS.settings,
    new PostgresOrganizationSettingsRepository(database),
  );
}
