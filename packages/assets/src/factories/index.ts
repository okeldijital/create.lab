import { Asset, type CreateAssetProps } from "../aggregates/Asset/Asset.js";
import {
  AssetVersion,
  type CreateAssetVersionProps,
} from "../aggregates/AssetVersion/AssetVersion.js";
import {
  AssetCollection,
  type CreateAssetCollectionProps,
} from "../aggregates/AssetCollection/AssetCollection.js";
import {
  AssetRelationship,
  type CreateAssetRelationshipProps,
} from "../aggregates/AssetRelationship/AssetRelationship.js";

export const AssetFactory = {
  create: (props: CreateAssetProps) => Asset.create(props),
  reconstitute: Asset.reconstitute.bind(Asset),
};

export const AssetVersionFactory = {
  create: (props: CreateAssetVersionProps) => AssetVersion.create(props),
  reconstitute: AssetVersion.reconstitute.bind(AssetVersion),
};

export const AssetCollectionFactory = {
  create: (props: CreateAssetCollectionProps) =>
    AssetCollection.create(props),
  reconstitute: AssetCollection.reconstitute.bind(AssetCollection),
};

export const AssetRelationshipFactory = {
  create: (props: CreateAssetRelationshipProps) =>
    AssetRelationship.create(props),
  reconstitute: AssetRelationship.reconstitute.bind(AssetRelationship),
};
