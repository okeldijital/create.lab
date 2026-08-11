import { Worker } from "../aggregates/Worker/Worker.js";
import type { CreateWorkerProps } from "../aggregates/Worker/Worker.js";
import { Position } from "../aggregates/Position/Position.js";
import type { CreatePositionProps } from "../aggregates/Position/Position.js";
import { Employment } from "../aggregates/Employment/Employment.js";
import type { CreateEmploymentProps } from "../aggregates/Employment/Employment.js";
import { EmploymentContract } from "../aggregates/EmploymentContract/EmploymentContract.js";
import type { CreateEmploymentContractProps } from "../aggregates/EmploymentContract/EmploymentContract.js";
import { ReportingRelationship } from "../aggregates/ReportingRelationship/ReportingRelationship.js";
import type { CreateReportingRelationshipProps } from "../aggregates/ReportingRelationship/ReportingRelationship.js";

export const WorkerFactory = {
  create: (props: CreateWorkerProps) => Worker.create(props),
  reconstitute: Worker.reconstitute.bind(Worker),
};

export const PositionFactory = {
  create: (props: CreatePositionProps) => Position.create(props),
  reconstitute: Position.reconstitute.bind(Position),
};

export const EmploymentFactory = {
  create: (props: CreateEmploymentProps) => Employment.create(props),
  reconstitute: Employment.reconstitute.bind(Employment),
};

export const EmploymentContractFactory = {
  create: (props: CreateEmploymentContractProps) =>
    EmploymentContract.create(props),
  reconstitute: EmploymentContract.reconstitute.bind(EmploymentContract),
};

export const ReportingRelationshipFactory = {
  create: (props: CreateReportingRelationshipProps) =>
    ReportingRelationship.create(props),
  reconstitute: ReportingRelationship.reconstitute.bind(ReportingRelationship),
};
