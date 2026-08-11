import type { Contract } from "../aggregates/Contract/Contract.js";
import {
  ContractStatus,
  canTransitionContract,
} from "../enums/ContractStatus.js";
import {
  ContractAlreadyActiveError,
  InvalidContractStateError,
} from "../errors/ContractErrors.js";

export class ContractLifecyclePolicy {
  static assertCanTransition(contract: Contract, to: ContractStatus): void {
    if (contract.isArchived) {
      throw new InvalidContractStateError(
        "Archived contracts are immutable.",
      );
    }
    if (!canTransitionContract(contract.status, to)) {
      throw new InvalidContractStateError(
        `Illegal contract transition: ${contract.status} → ${to}.`,
      );
    }
  }

  static assertEditable(contract: Contract): void {
    if (contract.isArchived) {
      throw new InvalidContractStateError(
        "Archived contracts are immutable.",
      );
    }
    if (
      contract.status === ContractStatus.ACTIVE ||
      contract.status === ContractStatus.EXPIRED ||
      contract.status === ContractStatus.TERMINATED
    ) {
      // Structure of current version is locked; amendments use new versions.
    }
  }

  static assertDraftOrPending(contract: Contract): void {
    if (
      contract.status !== ContractStatus.DRAFT &&
      contract.status !== ContractStatus.PENDING_SIGNATURE
    ) {
      throw new InvalidContractStateError(
        "Terms can only be modified before activation.",
      );
    }
  }

  static assertCanActivate(contract: Contract): void {
    if (contract.isActive) {
      throw new ContractAlreadyActiveError(contract.id);
    }
    ContractLifecyclePolicy.assertCanTransition(
      contract,
      ContractStatus.ACTIVE,
    );
  }
}
