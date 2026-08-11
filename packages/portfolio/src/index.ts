/**
 * @creative-lab/portfolio
 *
 * Portfolio Management bounded context — EPIC-219.
 * Strategic portfolios, programs, initiatives, and governance milestones.
 * No execution, scheduling, allocation, production, or billing.
 */

export {
  Portfolio,
  Program,
  Initiative,
  PortfolioMilestone,
} from "./aggregates/index.js";
export type {
  CreatePortfolioProps,
  PortfolioSnapshot,
  CreateProgramProps,
  ProgramSnapshot,
  CreateInitiativeProps,
  InitiativeSnapshot,
  CreatePortfolioMilestoneProps,
  PortfolioMilestoneSnapshot,
} from "./aggregates/index.js";

export {
  PortfolioNumber,
  PortfolioName,
  ProgramName,
  InitiativeTitle,
  MilestoneTitle,
  PortfolioDescription,
  SequenceNumber,
} from "./value-objects/index.js";

export {
  PortfolioStatus,
  PORTFOLIO_TRANSITIONS,
  canTransitionPortfolio,
  ProgramStatus,
  PROGRAM_TRANSITIONS,
  canTransitionProgram,
  InitiativeStatus,
  INITIATIVE_TRANSITIONS,
  canTransitionInitiative,
  MilestoneStatus,
  MILESTONE_TRANSITIONS,
  canTransitionMilestone,
  InitiativePriority,
} from "./enums/index.js";

export {
  PortfolioCreated,
  PortfolioActivated,
  PortfolioHeld,
  PortfolioCompleted,
  PortfolioCancelled,
  PortfolioArchived,
  ProgramCreated,
  ProgramCompleted,
  InitiativeCreated,
  InitiativeCompleted,
  InitiativeCancelled,
  PortfolioMilestoneCreated,
  PortfolioMilestoneActivated,
  PortfolioMilestoneCompleted,
} from "./events/index.js";

export type {
  PortfolioRepository,
  ProgramRepository,
  InitiativeRepository,
  PortfolioMilestoneRepository,
} from "./repositories/index.js";

export {
  PortfolioService,
  ProgramService,
  InitiativeService,
  PortfolioMilestoneService,
} from "./services/index.js";
export type {
  PortfolioServiceDeps,
  ProgramServiceDeps,
  AddProgramProps,
  InitiativeServiceDeps,
  AddInitiativeProps,
  PortfolioMilestoneServiceDeps,
  AddMilestoneProps,
} from "./services/index.js";

export {
  PortfolioLifecyclePolicy,
  ProgramPolicy,
  InitiativePolicy,
  PortfolioMilestonePolicy,
} from "./policies/index.js";

export {
  PortfolioFactory,
  ProgramFactory,
  InitiativeFactory,
  PortfolioMilestoneFactory,
} from "./factories/index.js";

export {
  PortfolioNotFoundError,
  DuplicatePortfolioNumberError,
  ProgramNotFoundError,
  InitiativeNotFoundError,
  PortfolioMilestoneNotFoundError,
  InvalidPortfolioStateError,
  DuplicateInitiativeTitleError,
  ProgramSequenceError,
  PortfolioValidationError,
} from "./errors/index.js";

export type {
  PortfolioId,
  ProgramId,
  InitiativeId,
  PortfolioMilestoneId,
  OrganizationId,
  EngagementId,
  ProjectId,
} from "./types/index.js";
export {
  asPortfolioId,
  asProgramId,
  asInitiativeId,
  asPortfolioMilestoneId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
