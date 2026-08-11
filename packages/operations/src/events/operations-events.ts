import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { WorkOrderStatus } from "../enums/WorkOrderStatus.js";
import type { SessionStatus } from "../enums/SessionStatus.js";
import type { OutputStatus } from "../enums/OutputStatus.js";
import type { OutputType } from "../enums/OutputType.js";
import type { IncidentSeverity } from "../enums/IncidentSeverity.js";
import type { IncidentType } from "../enums/IncidentType.js";
import type {
  WorkIncidentId,
  WorkMilestoneId,
  WorkOrderId,
  WorkOutputId,
  WorkSessionId,
} from "../types/ids.js";

export class WorkOrderCreated extends DomainEvent<
  "WorkOrderCreated",
  Readonly<{
    workOrderId: string;
    allocationId: string;
    bookingId: string;
    title: string;
    status: WorkOrderStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    workOrderId: WorkOrderId;
    allocationId: string;
    bookingId: string;
    title: string;
    status: WorkOrderStatus;
    occurredAt?: Date;
  }): WorkOrderCreated {
    return new WorkOrderCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkOrderCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workOrderId,
      organizationId: input.organizationId,
      payload: {
        workOrderId: input.workOrderId,
        allocationId: input.allocationId,
        bookingId: input.bookingId,
        title: input.title,
        status: input.status,
      },
    });
  }
}

export class WorkStarted extends DomainEvent<
  "WorkStarted",
  Readonly<{ workOrderId: string; actualStart: string }>
> {
  static create(input: {
    organizationId: string;
    workOrderId: WorkOrderId;
    actualStart: Date;
    occurredAt?: Date;
  }): WorkStarted {
    return new WorkStarted({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkStarted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workOrderId,
      organizationId: input.organizationId,
      payload: {
        workOrderId: input.workOrderId,
        actualStart: input.actualStart.toISOString(),
      },
    });
  }
}

export class WorkPaused extends DomainEvent<
  "WorkPaused",
  Readonly<{ workOrderId: string }>
> {
  static create(input: {
    organizationId: string;
    workOrderId: WorkOrderId;
    occurredAt?: Date;
  }): WorkPaused {
    return new WorkPaused({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkPaused",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workOrderId,
      organizationId: input.organizationId,
      payload: { workOrderId: input.workOrderId },
    });
  }
}

export class WorkCompleted extends DomainEvent<
  "WorkCompleted",
  Readonly<{ workOrderId: string; actualEnd: string }>
> {
  static create(input: {
    organizationId: string;
    workOrderId: WorkOrderId;
    actualEnd: Date;
    occurredAt?: Date;
  }): WorkCompleted {
    return new WorkCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workOrderId,
      organizationId: input.organizationId,
      payload: {
        workOrderId: input.workOrderId,
        actualEnd: input.actualEnd.toISOString(),
      },
    });
  }
}

export class WorkClosed extends DomainEvent<
  "WorkClosed",
  Readonly<{ workOrderId: string; closedAt: string }>
> {
  static create(input: {
    organizationId: string;
    workOrderId: WorkOrderId;
    closedAt: Date;
    occurredAt?: Date;
  }): WorkClosed {
    return new WorkClosed({
      eventId: DomainEvent.nextEventId(),
      eventType: "WorkClosed",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.workOrderId,
      organizationId: input.organizationId,
      payload: {
        workOrderId: input.workOrderId,
        closedAt: input.closedAt.toISOString(),
      },
    });
  }
}

export class SessionStarted extends DomainEvent<
  "SessionStarted",
  Readonly<{ sessionId: string; workOrderId: string; startedAt: string }>
> {
  static create(input: {
    organizationId: string;
    sessionId: WorkSessionId;
    workOrderId: WorkOrderId;
    startedAt: Date;
    occurredAt?: Date;
  }): SessionStarted {
    return new SessionStarted({
      eventId: DomainEvent.nextEventId(),
      eventType: "SessionStarted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.sessionId,
      organizationId: input.organizationId,
      payload: {
        sessionId: input.sessionId,
        workOrderId: input.workOrderId,
        startedAt: input.startedAt.toISOString(),
      },
    });
  }
}

export class SessionEnded extends DomainEvent<
  "SessionEnded",
  Readonly<{
    sessionId: string;
    workOrderId: string;
    endedAt: string;
    durationMs: number;
  }>
> {
  static create(input: {
    organizationId: string;
    sessionId: WorkSessionId;
    workOrderId: WorkOrderId;
    endedAt: Date;
    durationMs: number;
    occurredAt?: Date;
  }): SessionEnded {
    return new SessionEnded({
      eventId: DomainEvent.nextEventId(),
      eventType: "SessionEnded",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.sessionId,
      organizationId: input.organizationId,
      payload: {
        sessionId: input.sessionId,
        workOrderId: input.workOrderId,
        endedAt: input.endedAt.toISOString(),
        durationMs: input.durationMs,
      },
    });
  }
}

export class MilestoneCompleted extends DomainEvent<
  "MilestoneCompleted",
  Readonly<{ milestoneId: string; workOrderId: string; name: string }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: WorkMilestoneId;
    workOrderId: WorkOrderId;
    name: string;
    occurredAt?: Date;
  }): MilestoneCompleted {
    return new MilestoneCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "MilestoneCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.milestoneId,
      organizationId: input.organizationId,
      payload: {
        milestoneId: input.milestoneId,
        workOrderId: input.workOrderId,
        name: input.name,
      },
    });
  }
}

export class OutputCreated extends DomainEvent<
  "OutputCreated",
  Readonly<{
    outputId: string;
    workOrderId: string;
    name: string;
    version: number;
    outputType: OutputType;
  }>
> {
  static create(input: {
    organizationId: string;
    outputId: WorkOutputId;
    workOrderId: WorkOrderId;
    name: string;
    version: number;
    outputType: OutputType;
    occurredAt?: Date;
  }): OutputCreated {
    return new OutputCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "OutputCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.outputId,
      organizationId: input.organizationId,
      payload: {
        outputId: input.outputId,
        workOrderId: input.workOrderId,
        name: input.name,
        version: input.version,
        outputType: input.outputType,
      },
    });
  }
}

export class OutputApproved extends DomainEvent<
  "OutputApproved",
  Readonly<{ outputId: string; workOrderId: string; version: number }>
> {
  static create(input: {
    organizationId: string;
    outputId: WorkOutputId;
    workOrderId: WorkOrderId;
    version: number;
    occurredAt?: Date;
  }): OutputApproved {
    return new OutputApproved({
      eventId: DomainEvent.nextEventId(),
      eventType: "OutputApproved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.outputId,
      organizationId: input.organizationId,
      payload: {
        outputId: input.outputId,
        workOrderId: input.workOrderId,
        version: input.version,
      },
    });
  }
}

export class IncidentReported extends DomainEvent<
  "IncidentReported",
  Readonly<{
    incidentId: string;
    workOrderId: string;
    incidentType: IncidentType;
    severity: IncidentSeverity;
  }>
> {
  static create(input: {
    organizationId: string;
    incidentId: WorkIncidentId;
    workOrderId: WorkOrderId;
    incidentType: IncidentType;
    severity: IncidentSeverity;
    occurredAt?: Date;
  }): IncidentReported {
    return new IncidentReported({
      eventId: DomainEvent.nextEventId(),
      eventType: "IncidentReported",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.incidentId,
      organizationId: input.organizationId,
      payload: {
        incidentId: input.incidentId,
        workOrderId: input.workOrderId,
        incidentType: input.incidentType,
        severity: input.severity,
      },
    });
  }
}

export class IncidentResolved extends DomainEvent<
  "IncidentResolved",
  Readonly<{ incidentId: string; workOrderId: string }>
> {
  static create(input: {
    organizationId: string;
    incidentId: WorkIncidentId;
    workOrderId: WorkOrderId;
    occurredAt?: Date;
  }): IncidentResolved {
    return new IncidentResolved({
      eventId: DomainEvent.nextEventId(),
      eventType: "IncidentResolved",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.incidentId,
      organizationId: input.organizationId,
      payload: {
        incidentId: input.incidentId,
        workOrderId: input.workOrderId,
      },
    });
  }
}

// silence unused SessionStatus import if only used in future
export type { SessionStatus, OutputStatus };
