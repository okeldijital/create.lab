import {
  Service,
  type CreateServiceProps,
} from "../aggregates/Service/Service.js";
import {
  ServiceCategory,
  type CreateServiceCategoryProps,
} from "../aggregates/ServiceCategory/ServiceCategory.js";
import {
  PriceBook,
  type CreatePriceBookProps,
} from "../aggregates/PriceBook/PriceBook.js";
import {
  PriceRule,
  type CreatePriceRuleProps,
} from "../aggregates/PriceRule/PriceRule.js";

export const ServiceFactory = {
  create: (props: CreateServiceProps) => Service.create(props),
  reconstitute: Service.reconstitute.bind(Service),
};

export const ServiceCategoryFactory = {
  create: (props: CreateServiceCategoryProps) =>
    ServiceCategory.create(props),
  reconstitute: ServiceCategory.reconstitute.bind(ServiceCategory),
};

export const PriceBookFactory = {
  create: (props: CreatePriceBookProps) => PriceBook.create(props),
  reconstitute: PriceBook.reconstitute.bind(PriceBook),
};

export const PriceRuleFactory = {
  create: (props: CreatePriceRuleProps) => PriceRule.create(props),
  reconstitute: PriceRule.reconstitute.bind(PriceRule),
};
