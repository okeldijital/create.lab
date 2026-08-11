import type { AssetVersion } from "../aggregates/AssetVersion/AssetVersion.js";
import { AssetVersionStatus } from "../enums/AssetVersionStatus.js";
import {
  CurrentVersionError,
  DuplicateVersionError,
  InvalidVersionError,
} from "../errors/AssetErrors.js";
import { VersionNumber } from "../value-objects/VersionNumber.js";

export class VersionPolicy {
  static nextNumber(existing: readonly AssetVersion[]): VersionNumber {
    if (existing.length === 0) return VersionNumber.first();
    const max = Math.max(...existing.map((v) => v.versionNumber.value));
    return VersionNumber.create(max + 1);
  }

  static assertSequential(
    existing: readonly AssetVersion[],
    versionNumber: number,
  ): void {
    const expected = VersionPolicy.nextNumber(existing).value;
    if (versionNumber !== expected) {
      throw new DuplicateVersionError(
        `Version number must be sequential: expected ${expected}, received ${versionNumber}.`,
      );
    }
  }

  static assertUniqueNumber(
    existing: readonly AssetVersion[],
    versionNumber: number,
  ): void {
    if (existing.some((v) => v.versionNumber.value === versionNumber)) {
      throw new DuplicateVersionError(
        `Version number ${versionNumber} already exists for this asset.`,
      );
    }
  }

  static assertSingleCurrent(existing: readonly AssetVersion[]): void {
    const current = existing.filter(
      (v) => v.status === AssetVersionStatus.CURRENT,
    );
    if (current.length > 1) {
      throw new CurrentVersionError(
        `Asset has ${current.length} CURRENT versions; expected exactly one.`,
      );
    }
  }

  static assertBelongsToAsset(
    version: AssetVersion,
    assetId: string,
  ): void {
    if (version.assetId !== assetId) {
      throw new InvalidVersionError(
        `Version "${version.id}" does not belong to asset "${assetId}".`,
      );
    }
  }
}
