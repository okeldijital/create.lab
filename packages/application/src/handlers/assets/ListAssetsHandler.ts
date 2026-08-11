import type { AssetRepository } from "@creative-lab/assets";
import type { AssetDto } from "../../dto/common.js";
import type { QueryHandler } from "../../interfaces/Handler.js";
import { AssetMapper } from "../../mappers/AssetMapper.js";
import type { ListAssetsQuery } from "../../queries/ListAssetsQuery.js";
import type { ApplicationContext } from "../../types/context.js";

export type ListAssetsHandlerDeps = {
  assetRepository: AssetRepository;
};

export class ListAssetsHandler
  implements QueryHandler<ListAssetsQuery, AssetDto[]>
{
  readonly queryType = "ListAssets" as const;

  constructor(private readonly deps: ListAssetsHandlerDeps) {}

  async handle(
    query: ListAssetsQuery,
    context: ApplicationContext,
  ): Promise<AssetDto[]> {
    let assets = await this.deps.assetRepository.findByOrganization(
      context.organizationId,
    );
    if (query.projectId) {
      assets = assets.filter((a) => a.projectId === query.projectId);
    }
    if (query.status) {
      assets = assets.filter((a) => a.status === query.status);
    }
    return assets.map((a) => AssetMapper.toDto(a));
  }
}
