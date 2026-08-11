import { DomainEvent, DOMAIN_EVENT_VERSION } from "@creative-lab/core";
import type { PortfolioStatus } from "../enums/PortfolioStatus.js";
import type { ProgramStatus } from "../enums/ProgramStatus.js";
import type { InitiativeStatus } from "../enums/InitiativeStatus.js";
import type { MilestoneStatus } from "../enums/MilestoneStatus.js";
import type {
  InitiativeId,
  PortfolioId,
  PortfolioMilestoneId,
  ProgramId,
} from "../types/ids.js";

export class PortfolioCreated extends DomainEvent<
  "PortfolioCreated",
  Readonly<{
    portfolioId: string;
    portfolioNumber: string;
    name: string;
    status: PortfolioStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    portfolioId: PortfolioId;
    portfolioNumber: string;
    name: string;
    status: PortfolioStatus;
    occurredAt?: Date;
  }): PortfolioCreated {
    return new PortfolioCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.portfolioId,
      organizationId: input.organizationId,
      payload: {
        portfolioId: input.portfolioId,
        portfolioNumber: input.portfolioNumber,
        name: input.name,
        status: input.status,
      },
    });
  }
}

export class PortfolioActivated extends DomainEvent<
  "PortfolioActivated",
  Readonly<{ portfolioId: string }>
> {
  static create(input: {
    organizationId: string;
    portfolioId: PortfolioId;
    occurredAt?: Date;
  }): PortfolioActivated {
    return new PortfolioActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.portfolioId,
      organizationId: input.organizationId,
      payload: { portfolioId: input.portfolioId },
    });
  }
}

export class PortfolioHeld extends DomainEvent<
  "PortfolioHeld",
  Readonly<{ portfolioId: string }>
> {
  static create(input: {
    organizationId: string;
    portfolioId: PortfolioId;
    occurredAt?: Date;
  }): PortfolioHeld {
    return new PortfolioHeld({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioHeld",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.portfolioId,
      organizationId: input.organizationId,
      payload: { portfolioId: input.portfolioId },
    });
  }
}

export class PortfolioCompleted extends DomainEvent<
  "PortfolioCompleted",
  Readonly<{ portfolioId: string; completedDate: string }>
> {
  static create(input: {
    organizationId: string;
    portfolioId: PortfolioId;
    completedDate: Date;
    occurredAt?: Date;
  }): PortfolioCompleted {
    return new PortfolioCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.portfolioId,
      organizationId: input.organizationId,
      payload: {
        portfolioId: input.portfolioId,
        completedDate: input.completedDate.toISOString(),
      },
    });
  }
}

export class PortfolioCancelled extends DomainEvent<
  "PortfolioCancelled",
  Readonly<{ portfolioId: string }>
> {
  static create(input: {
    organizationId: string;
    portfolioId: PortfolioId;
    occurredAt?: Date;
  }): PortfolioCancelled {
    return new PortfolioCancelled({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioCancelled",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.portfolioId,
      organizationId: input.organizationId,
      payload: { portfolioId: input.portfolioId },
    });
  }
}

export class PortfolioArchived extends DomainEvent<
  "PortfolioArchived",
  Readonly<{ portfolioId: string }>
> {
  static create(input: {
    organizationId: string;
    portfolioId: PortfolioId;
    occurredAt?: Date;
  }): PortfolioArchived {
    return new PortfolioArchived({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioArchived",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.portfolioId,
      organizationId: input.organizationId,
      payload: { portfolioId: input.portfolioId },
    });
  }
}

export class ProgramCreated extends DomainEvent<
  "ProgramCreated",
  Readonly<{
    programId: string;
    portfolioId: string;
    name: string;
    sequence: number;
    status: ProgramStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    programId: ProgramId;
    portfolioId: PortfolioId;
    name: string;
    sequence: number;
    status: ProgramStatus;
    occurredAt?: Date;
  }): ProgramCreated {
    return new ProgramCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProgramCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.programId,
      organizationId: input.organizationId,
      payload: {
        programId: input.programId,
        portfolioId: input.portfolioId,
        name: input.name,
        sequence: input.sequence,
        status: input.status,
      },
    });
  }
}

export class ProgramCompleted extends DomainEvent<
  "ProgramCompleted",
  Readonly<{ programId: string; portfolioId: string }>
> {
  static create(input: {
    organizationId: string;
    programId: ProgramId;
    portfolioId: PortfolioId;
    occurredAt?: Date;
  }): ProgramCompleted {
    return new ProgramCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "ProgramCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.programId,
      organizationId: input.organizationId,
      payload: {
        programId: input.programId,
        portfolioId: input.portfolioId,
      },
    });
  }
}

export class InitiativeCreated extends DomainEvent<
  "InitiativeCreated",
  Readonly<{
    initiativeId: string;
    portfolioId: string;
    title: string;
    status: InitiativeStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    initiativeId: InitiativeId;
    portfolioId: PortfolioId;
    title: string;
    status: InitiativeStatus;
    occurredAt?: Date;
  }): InitiativeCreated {
    return new InitiativeCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "InitiativeCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.initiativeId,
      organizationId: input.organizationId,
      payload: {
        initiativeId: input.initiativeId,
        portfolioId: input.portfolioId,
        title: input.title,
        status: input.status,
      },
    });
  }
}

export class InitiativeCompleted extends DomainEvent<
  "InitiativeCompleted",
  Readonly<{ initiativeId: string; portfolioId: string }>
> {
  static create(input: {
    organizationId: string;
    initiativeId: InitiativeId;
    portfolioId: PortfolioId;
    occurredAt?: Date;
  }): InitiativeCompleted {
    return new InitiativeCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "InitiativeCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.initiativeId,
      organizationId: input.organizationId,
      payload: {
        initiativeId: input.initiativeId,
        portfolioId: input.portfolioId,
      },
    });
  }
}

export class InitiativeCancelled extends DomainEvent<
  "InitiativeCancelled",
  Readonly<{ initiativeId: string; portfolioId: string }>
> {
  static create(input: {
    organizationId: string;
    initiativeId: InitiativeId;
    portfolioId: PortfolioId;
    occurredAt?: Date;
  }): InitiativeCancelled {
    return new InitiativeCancelled({
      eventId: DomainEvent.nextEventId(),
      eventType: "InitiativeCancelled",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.initiativeId,
      organizationId: input.organizationId,
      payload: {
        initiativeId: input.initiativeId,
        portfolioId: input.portfolioId,
      },
    });
  }
}

export class PortfolioMilestoneCreated extends DomainEvent<
  "PortfolioMilestoneCreated",
  Readonly<{
    milestoneId: string;
    portfolioId: string;
    title: string;
    sequence: number;
  }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: PortfolioMilestoneId;
    portfolioId: PortfolioId;
    title: string;
    sequence: number;
    occurredAt?: Date;
  }): PortfolioMilestoneCreated {
    return new PortfolioMilestoneCreated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioMilestoneCreated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.milestoneId,
      organizationId: input.organizationId,
      payload: {
        milestoneId: input.milestoneId,
        portfolioId: input.portfolioId,
        title: input.title,
        sequence: input.sequence,
      },
    });
  }
}

export class PortfolioMilestoneActivated extends DomainEvent<
  "PortfolioMilestoneActivated",
  Readonly<{
    milestoneId: string;
    portfolioId: string;
    status: MilestoneStatus;
  }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: PortfolioMilestoneId;
    portfolioId: PortfolioId;
    status: MilestoneStatus;
    occurredAt?: Date;
  }): PortfolioMilestoneActivated {
    return new PortfolioMilestoneActivated({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioMilestoneActivated",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.milestoneId,
      organizationId: input.organizationId,
      payload: {
        milestoneId: input.milestoneId,
        portfolioId: input.portfolioId,
        status: input.status,
      },
    });
  }
}

export class PortfolioMilestoneCompleted extends DomainEvent<
  "PortfolioMilestoneCompleted",
  Readonly<{ milestoneId: string; portfolioId: string }>
> {
  static create(input: {
    organizationId: string;
    milestoneId: PortfolioMilestoneId;
    portfolioId: PortfolioId;
    occurredAt?: Date;
  }): PortfolioMilestoneCompleted {
    return new PortfolioMilestoneCompleted({
      eventId: DomainEvent.nextEventId(),
      eventType: "PortfolioMilestoneCompleted",
      eventVersion: DOMAIN_EVENT_VERSION,
      occurredAt: DomainEvent.now(input.occurredAt),
      aggregateId: input.milestoneId,
      organizationId: input.organizationId,
      payload: {
        milestoneId: input.milestoneId,
        portfolioId: input.portfolioId,
      },
    });
  }
}
