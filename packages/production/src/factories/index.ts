import {
  Production,
  type CreateProductionProps,
} from "../aggregates/Production/Production.js";
import {
  ProductionSession,
  type CreateProductionSessionProps,
} from "../aggregates/ProductionSession/ProductionSession.js";
import {
  ProductionMilestone,
  type CreateProductionMilestoneProps,
} from "../aggregates/ProductionMilestone/ProductionMilestone.js";
import {
  Revision,
  type CreateRevisionProps,
} from "../aggregates/Revision/Revision.js";

export const ProductionFactory = {
  create: (props: CreateProductionProps) => Production.create(props),
  reconstitute: Production.reconstitute.bind(Production),
};

export const ProductionSessionFactory = {
  create: (props: CreateProductionSessionProps) =>
    ProductionSession.create(props),
  reconstitute: ProductionSession.reconstitute.bind(ProductionSession),
};

export const ProductionMilestoneFactory = {
  create: (props: CreateProductionMilestoneProps) =>
    ProductionMilestone.create(props),
  reconstitute: ProductionMilestone.reconstitute.bind(ProductionMilestone),
};

export const RevisionFactory = {
  create: (props: CreateRevisionProps) => Revision.create(props),
  reconstitute: Revision.reconstitute.bind(Revision),
};
