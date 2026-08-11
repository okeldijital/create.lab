declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type AssetId = Brand<string, "AssetId">;
export type AssetVersionId = Brand<string, "AssetVersionId">;
export type AssetCollectionId = Brand<string, "AssetCollectionId">;
export type AssetRelationshipId = Brand<string, "AssetRelationshipId">;

export function asAssetId(value: string): AssetId {
  return value as AssetId;
}
export function asAssetVersionId(value: string): AssetVersionId {
  return value as AssetVersionId;
}
export function asAssetCollectionId(value: string): AssetCollectionId {
  return value as AssetCollectionId;
}
export function asAssetRelationshipId(value: string): AssetRelationshipId {
  return value as AssetRelationshipId;
}
