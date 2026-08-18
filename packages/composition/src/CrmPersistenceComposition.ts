import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import { PostgresCustomerRepository, PostgresContactRepository, PostgresOpportunityRepository, PostgresInteractionRepository } from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const CRM_REPOSITORY_KEYS = {
  customer: "customer",
  contact: "contact",
  opportunity: "opportunity",
  interaction: "interaction",
} as const;

export function registerPostgresCrmRepositories(composition: ApplicationComposition, database: DrizzleDatabase): void {
  composition.repositories.register(CRM_REPOSITORY_KEYS.customer, new PostgresCustomerRepository(database));
  composition.repositories.register(CRM_REPOSITORY_KEYS.contact, new PostgresContactRepository(database));
  composition.repositories.register(CRM_REPOSITORY_KEYS.opportunity, new PostgresOpportunityRepository(database));
  composition.repositories.register(CRM_REPOSITORY_KEYS.interaction, new PostgresInteractionRepository(database));
}
