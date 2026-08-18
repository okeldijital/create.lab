import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresAllocationGroupRepository,
  PostgresAllocationRepository,
  PostgresReservationRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const ALLOCATION_REPOSITORY_KEYS = {
  allocation: "allocation",
  allocationGroup: "allocationGroup",
  reservation: "reservation",
} as const;

export function registerPostgresAllocationRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(
    ALLOCATION_REPOSITORY_KEYS.allocation,
    new PostgresAllocationRepository(database),
  );
  composition.repositories.register(
    ALLOCATION_REPOSITORY_KEYS.allocationGroup,
    new PostgresAllocationGroupRepository(database),
  );
  composition.repositories.register(
    ALLOCATION_REPOSITORY_KEYS.reservation,
    new PostgresReservationRepository(database),
  );
}
