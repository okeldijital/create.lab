import type { ContractVersion } from "../aggregates/ContractVersion/ContractVersion.js";
import { ContractVersionStatus } from "../enums/ContractVersionStatus.js";
import { InvalidContractStateError } from "../errors/ContractErrors.js";

export class VersionPolicy {
  static assertEditable(
    version: ContractVersion,
    contractAllowsEdits: boolean,
  ): void {
    if (!contractAllowsEdits) {
      throw new InvalidContractStateError(
        "Versions are immutable after the contract is activated.",
      );
    }
    if (version.locked) {
      throw new InvalidContractStateError(
        "Locked contract versions are immutable.",
      );
    }
    if (version.status === ContractVersionStatus.SUPERSEDED) {
      throw new InvalidContractStateError(
        "Superseded versions cannot be edited.",
      );
    }
  }

  static nextVersionNumber(existing: readonly ContractVersion[]): number {
    return existing.reduce((m, v) => Math.max(m, v.versionNumber), 0) + 1;
  }

  static assertSequential(
    nextNumber: number,
    existing: readonly ContractVersion[],
  ): void {
    const expected = VersionPolicy.nextVersionNumber(existing);
    if (nextNumber !== expected) {
      throw new InvalidContractStateError(
        `Version numbers must be sequential (expected ${expected}, got ${nextNumber}).`,
      );
    }
  }

  static assertOneCurrent(versions: readonly ContractVersion[]): void {
    const currents = versions.filter((v) => v.isCurrent);
    if (currents.length > 1) {
      throw new InvalidContractStateError(
        "Exactly one current version is allowed.",
      );
    }
  }
}
