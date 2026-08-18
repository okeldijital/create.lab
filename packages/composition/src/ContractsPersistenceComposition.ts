import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresContractAmendmentRepository,
  PostgresContractRepository,
  PostgresContractTermRepository,
  PostgresContractVersionRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const CONTRACTS_REPOSITORY_KEYS = {
  contract: "contract",
  contractVersion: "contractVersion",
  contractTerm: "contractTerm",
  contractAmendment: "contractAmendment",
} as const;

export function registerPostgresContractsRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(CONTRACTS_REPOSITORY_KEYS.contract, new PostgresContractRepository(database));
  composition.repositories.register(CONTRACTS_REPOSITORY_KEYS.contractVersion, new PostgresContractVersionRepository(database));
  composition.repositories.register(CONTRACTS_REPOSITORY_KEYS.contractTerm, new PostgresContractTermRepository(database));
  composition.repositories.register(CONTRACTS_REPOSITORY_KEYS.contractAmendment, new PostgresContractAmendmentRepository(database));
}
