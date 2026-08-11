import {
  Portfolio,
  type CreatePortfolioProps,
} from "../aggregates/Portfolio/Portfolio.js";
import {
  Program,
  type CreateProgramProps,
} from "../aggregates/Program/Program.js";
import {
  Initiative,
  type CreateInitiativeProps,
} from "../aggregates/Initiative/Initiative.js";
import {
  PortfolioMilestone,
  type CreatePortfolioMilestoneProps,
} from "../aggregates/PortfolioMilestone/PortfolioMilestone.js";

export const PortfolioFactory = {
  create: (props: CreatePortfolioProps) => Portfolio.create(props),
  reconstitute: Portfolio.reconstitute.bind(Portfolio),
};

export const ProgramFactory = {
  create: (props: CreateProgramProps) => Program.create(props),
  reconstitute: Program.reconstitute.bind(Program),
};

export const InitiativeFactory = {
  create: (props: CreateInitiativeProps) => Initiative.create(props),
  reconstitute: Initiative.reconstitute.bind(Initiative),
};

export const PortfolioMilestoneFactory = {
  create: (props: CreatePortfolioMilestoneProps) =>
    PortfolioMilestone.create(props),
  reconstitute: PortfolioMilestone.reconstitute.bind(PortfolioMilestone),
};
