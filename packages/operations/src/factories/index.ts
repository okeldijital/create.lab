import {
  WorkOrder,
  type CreateWorkOrderProps,
} from "../aggregates/WorkOrder/WorkOrder.js";
import {
  WorkSession,
  type CreateWorkSessionProps,
} from "../aggregates/WorkSession/WorkSession.js";
import {
  WorkMilestone,
  type CreateWorkMilestoneProps,
} from "../aggregates/WorkMilestone/WorkMilestone.js";
import {
  WorkOutput,
  type CreateWorkOutputProps,
} from "../aggregates/WorkOutput/WorkOutput.js";
import {
  WorkIncident,
  type CreateWorkIncidentProps,
} from "../aggregates/WorkIncident/WorkIncident.js";

export const WorkOrderFactory = {
  create: (props: CreateWorkOrderProps) => WorkOrder.create(props),
  reconstitute: WorkOrder.reconstitute.bind(WorkOrder),
};

export const WorkSessionFactory = {
  create: (props: CreateWorkSessionProps) => WorkSession.create(props),
  reconstitute: WorkSession.reconstitute.bind(WorkSession),
};

export const WorkMilestoneFactory = {
  create: (props: CreateWorkMilestoneProps) => WorkMilestone.create(props),
  reconstitute: WorkMilestone.reconstitute.bind(WorkMilestone),
};

export const WorkOutputFactory = {
  create: (props: CreateWorkOutputProps) => WorkOutput.create(props),
  reconstitute: WorkOutput.reconstitute.bind(WorkOutput),
};

export const WorkIncidentFactory = {
  create: (props: CreateWorkIncidentProps) => WorkIncident.create(props),
  reconstitute: WorkIncident.reconstitute.bind(WorkIncident),
};
