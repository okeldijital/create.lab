import {
  Engagement,
  type CreateEngagementProps,
} from "../aggregates/Engagement/Engagement.js";
import {
  Deliverable,
  type CreateDeliverableProps,
} from "../aggregates/Deliverable/Deliverable.js";
import {
  Milestone,
  type CreateMilestoneProps,
} from "../aggregates/Milestone/Milestone.js";
import {
  Obligation,
  type CreateObligationProps,
} from "../aggregates/Obligation/Obligation.js";

export const EngagementFactory = {
  create: (props: CreateEngagementProps) => Engagement.create(props),
  reconstitute: Engagement.reconstitute.bind(Engagement),
};

export const DeliverableFactory = {
  create: (props: CreateDeliverableProps) => Deliverable.create(props),
  reconstitute: Deliverable.reconstitute.bind(Deliverable),
};

export const MilestoneFactory = {
  create: (props: CreateMilestoneProps) => Milestone.create(props),
  reconstitute: Milestone.reconstitute.bind(Milestone),
};

export const ObligationFactory = {
  create: (props: CreateObligationProps) => Obligation.create(props),
  reconstitute: Obligation.reconstitute.bind(Obligation),
};
