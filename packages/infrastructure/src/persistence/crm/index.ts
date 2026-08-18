export { customers, contacts, opportunities, interactions, crmSchema } from "./schema.js";
export { CustomerMapper, ContactMapper, OpportunityMapper, InteractionMapper } from "./mappers.js";
export { PostgresCustomerRepository } from "./CustomerRepositoryAdapter.js";
export { PostgresContactRepository } from "./ContactRepositoryAdapter.js";
export { PostgresOpportunityRepository } from "./OpportunityRepositoryAdapter.js";
export { PostgresInteractionRepository } from "./InteractionRepositoryAdapter.js";
