import type { Asset } from "@creative-lab/assets";
import type { AssetDto } from "../dto/common.js";

export class AssetMapper {
  static toDto(asset: Asset): AssetDto {
    return {
      id: asset.id,
      organizationId: asset.organizationId,
      name: asset.name.value,
      status: asset.status,
      projectId: asset.projectId,
    };
  }
}
