import type { AssetVersion } from "../aggregates/AssetVersion/AssetVersion.js";
import { AssetVersionStatus } from "../enums/AssetVersionStatus.js";
import { AssetVersionNotFoundError } from "../errors/AssetErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { VersionPolicy } from "../policies/VersionPolicy.js";
import type { AssetVersionRepository } from "../repositories/AssetVersionRepository.js";
import type { AssetId, AssetVersionId } from "../types/ids.js";

export type VersionServiceDeps = {
  assetVersionRepository: AssetVersionRepository;
  eventPublisher: DomainEventPublisher;
};

/**
 * Version validation and supersession helpers (orchestration with AssetService).
 */
export class VersionService {
  constructor(private readonly deps: VersionServiceDeps) {}

  async listByAsset(assetId: AssetId): Promise<AssetVersion[]> {
    return this.deps.assetVersionRepository.findByAsset(assetId);
  }

  async getById(id: AssetVersionId): Promise<AssetVersion> {
    const version = await this.deps.assetVersionRepository.findById(id);
    if (!version) throw new AssetVersionNotFoundError(id);
    return version;
  }

  async findCurrent(assetId: AssetId): Promise<AssetVersion | null> {
    return this.deps.assetVersionRepository.findCurrent(assetId);
  }

  async validateSequential(assetId: AssetId, versionNumber: number): Promise<void> {
    const existing = await this.deps.assetVersionRepository.findByAsset(assetId);
    VersionPolicy.assertSequential(existing, versionNumber);
  }

  async supersedeCurrent(assetId: AssetId): Promise<AssetVersion | null> {
    const current = await this.deps.assetVersionRepository.findCurrent(assetId);
    if (!current) return null;
    if (current.status === AssetVersionStatus.CURRENT) {
      current.markSuperseded();
      await this.deps.assetVersionRepository.update(current);
    }
    return current;
  }
}
