/**
 * @creative-lab/contracts
 *
 * Contract Management bounded context — EPIC-217.
 * Owns contractual agreements, versions, terms, and amendments.
 * No PDFs, digital signatures, legal storage, projects, or invoicing.
 */

export {
  Contract,
  ContractVersion,
  ContractTerm,
  ContractAmendment,
} from "./aggregates/index.js";
export type {
  CreateContractProps,
  ContractSnapshot,
  CreateContractVersionProps,
  ContractVersionSnapshot,
  CreateContractTermProps,
  ContractTermSnapshot,
  CreateContractAmendmentProps,
  ContractAmendmentSnapshot,
} from "./aggregates/index.js";

export {
  ContractNumber,
  ContractTitle,
  TermTitle,
  TermDescription,
  AmendmentReason,
  EffectivePeriod,
  VersionNumber,
} from "./value-objects/index.js";

export {
  ContractStatus,
  CONTRACT_TRANSITIONS,
  canTransitionContract,
  ContractVersionStatus,
  AmendmentStatus,
} from "./enums/index.js";

export {
  ContractCreated,
  ContractActivated,
  ContractExpired,
  ContractTerminated,
  ContractArchived,
  ContractVersionCreated,
  ContractVersionPromoted,
  ContractTermAdded,
  ContractTermRemoved,
  ContractAmendmentCreated,
  ContractAmendmentApproved,
  ContractAmendmentApplied,
} from "./events/index.js";

export type {
  ContractRepository,
  ContractVersionRepository,
  ContractTermRepository,
  ContractAmendmentRepository,
} from "./repositories/index.js";

export {
  ContractService,
  VersionService,
  TermService,
  AmendmentService,
} from "./services/index.js";
export type {
  ContractServiceDeps,
  VersionServiceDeps,
  TermServiceDeps,
  AddTermProps,
  AmendmentServiceDeps,
} from "./services/index.js";

export {
  ContractLifecyclePolicy,
  VersionPolicy,
  TermPolicy,
  AmendmentPolicy,
} from "./policies/index.js";

export {
  ContractFactory,
  ContractVersionFactory,
  ContractTermFactory,
  ContractAmendmentFactory,
} from "./factories/index.js";

export {
  ContractNotFoundError,
  DuplicateContractNumberError,
  ContractVersionNotFoundError,
  ContractAlreadyActiveError,
  ContractExpiredError,
  ContractTermError,
  MandatoryTermRemovalError,
  ContractAmendmentError,
  InvalidContractStateError,
  ContractValidationError,
  ContractTermNotFoundError,
  ContractAmendmentNotFoundError,
} from "./errors/index.js";

export type {
  ContractId,
  ContractVersionId,
  ContractTermId,
  ContractAmendmentId,
  OrganizationId,
  CustomerId,
  QuoteId,
} from "./types/index.js";
export {
  asContractId,
  asContractVersionId,
  asContractTermId,
  asContractAmendmentId,
  asOrganizationId,
} from "./types/index.js";

export type { DomainEventPublisher } from "./interfaces/index.js";

export { uniqueIds } from "./utils/index.js";
