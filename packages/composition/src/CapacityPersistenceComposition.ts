import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import { PostgresAvailabilityProfileRepository, PostgresCapabilityRepository, PostgresCapacityProfileRepository, PostgresResourceCapacityRepository, PostgresWorkingPatternRepository } from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const CAPACITY_REPOSITORY_KEYS = {
  capacityProfile: "capacityProfile",
  capability: "capability",
  availabilityProfile: "availabilityProfile",
  workingPattern: "workingPattern",
  resourceCapacity: "resourceCapacity",
} as const;

export function registerPostgresCapacityRepositories(composition: ApplicationComposition, database: DrizzleDatabase): void {
  composition.repositories.register(CAPACITY_REPOSITORY_KEYS.capacityProfile, new PostgresCapacityProfileRepository(database));
  composition.repositories.register(CAPACITY_REPOSITORY_KEYS.capability, new PostgresCapabilityRepository(database));
  composition.repositories.register(CAPACITY_REPOSITORY_KEYS.availabilityProfile, new PostgresAvailabilityProfileRepository(database));
  composition.repositories.register(CAPACITY_REPOSITORY_KEYS.workingPattern, new PostgresWorkingPatternRepository(database));
  composition.repositories.register(CAPACITY_REPOSITORY_KEYS.resourceCapacity, new PostgresResourceCapacityRepository(database));
}
