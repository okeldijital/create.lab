import type { Contract } from "../aggregates/Contract/Contract.js";
import type { ContractAmendment } from "../aggregates/ContractAmendment/ContractAmendment.js";
import { AmendmentStatus } from "../enums/AmendmentStatus.js";
import { ContractStatus } from "../enums/ContractStatus.js";
import { ContractAmendmentError } from "../errors/ContractErrors.js";

export class AmendmentPolicy {
  static assertCanCreate(contract: Contract): void {
    if (contract.status !== ContractStatus.ACTIVE) {
      throw new ContractAmendmentError(
        "Amendments can only be created for ACTIVE contracts.",
      );
    }
  }

  static assertCanApprove(amendment: ContractAmendment): void {
    if (amendment.status !== AmendmentStatus.DRAFT) {
      throw new ContractAmendmentError(
        `Only DRAFT amendments can be approved (status: ${amendment.status}).`,
      );
    }
  }

  static assertCanApply(amendment: ContractAmendment): void {
    if (amendment.status !== AmendmentStatus.APPROVED) {
      throw new ContractAmendmentError(
        "Only APPROVED amendments can be applied.",
      );
    }
  }

  static assertNotAppliedImmutable(amendment: ContractAmendment): void {
    if (amendment.isApplied) {
      throw new ContractAmendmentError(
        "Applied amendments are immutable.",
      );
    }
  }
}
