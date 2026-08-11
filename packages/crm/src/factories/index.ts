import {
  Customer,
  type CreateCustomerProps,
} from "../aggregates/Customer/Customer.js";
import {
  Contact,
  type CreateContactProps,
} from "../aggregates/Contact/Contact.js";
import {
  Opportunity,
  type CreateOpportunityProps,
} from "../aggregates/Opportunity/Opportunity.js";
import {
  Interaction,
  type CreateInteractionProps,
} from "../aggregates/Interaction/Interaction.js";

export const CustomerFactory = {
  create: (props: CreateCustomerProps) => Customer.create(props),
  reconstitute: Customer.reconstitute.bind(Customer),
};

export const ContactFactory = {
  create: (props: CreateContactProps) => Contact.create(props),
  reconstitute: Contact.reconstitute.bind(Contact),
};

export const OpportunityFactory = {
  create: (props: CreateOpportunityProps) => Opportunity.create(props),
  reconstitute: Opportunity.reconstitute.bind(Opportunity),
};

export const InteractionFactory = {
  create: (props: CreateInteractionProps) => Interaction.create(props),
  reconstitute: Interaction.reconstitute.bind(Interaction),
};
