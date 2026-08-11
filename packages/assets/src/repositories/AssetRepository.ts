import type { OrganizationId } from "@creative-lab/organization";
import type { ProductionId } from "@creative-lab/production";
import type { ProjectId } from "@creative-lab/projects";
import type { Asset } from "../aggregates/Asset/Asset.js";
import type { AssetType } from "../enums/AssetType.js";
import type { AssetId } from "../types/ids.js";

export interface AssetRepository {
  findById(id: AssetId): Promise<Asset | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Asset[]>;
  findByProject(projectId: ProjectId): Promise<Asset[]>;
  findByProduction(productionId: ProductionId): Promise<Asset[]>;
  findByType(assetType: AssetType): Promise<Asset[]>;
  save(asset: Asset): Promise<void>;
  update(asset: Asset): Promise<void>;
  archive(id: AssetId): Promise<void>;
  exists(id: AssetId): Promise<boolean>;
}
