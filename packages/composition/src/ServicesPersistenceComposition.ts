import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresCategoryRepository,
  PostgresPriceBookRepository,
  PostgresPriceRuleRepository,
  PostgresServiceRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const SERVICES_REPOSITORY_KEYS = {
  service: "service",
  category: "category",
  priceBook: "priceBook",
  priceRule: "priceRule",
} as const;

export function registerPostgresServicesRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(SERVICES_REPOSITORY_KEYS.service, new PostgresServiceRepository(database));
  composition.repositories.register(SERVICES_REPOSITORY_KEYS.category, new PostgresCategoryRepository(database));
  composition.repositories.register(SERVICES_REPOSITORY_KEYS.priceBook, new PostgresPriceBookRepository(database));
  composition.repositories.register(SERVICES_REPOSITORY_KEYS.priceRule, new PostgresPriceRuleRepository(database));
}
