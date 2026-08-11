import type { AssetRelationship } from "../aggregates/AssetRelationship/AssetRelationship.js";
import type { RelationshipType } from "../enums/RelationshipType.js";
import {
  CircularRelationshipError,
  DuplicateRelationshipError,
} from "../errors/AssetErrors.js";
import type { AssetId } from "../types/ids.js";

export class RelationshipPolicy {
  static assertNotSelf(sourceAssetId: AssetId, targetAssetId: AssetId): void {
    if (sourceAssetId === targetAssetId) {
      throw new CircularRelationshipError(
        "Asset cannot relate to itself.",
      );
    }
  }

  static assertNoDuplicate(
    existing: readonly AssetRelationship[],
    sourceAssetId: AssetId,
    targetAssetId: AssetId,
    relationshipType: RelationshipType,
  ): void {
    RelationshipPolicy.assertNotSelf(sourceAssetId, targetAssetId);
    const dup = existing.find(
      (r) =>
        r.isActive &&
        r.matches(sourceAssetId, targetAssetId, relationshipType),
    );
    if (dup) {
      throw new DuplicateRelationshipError(
        `Relationship ${sourceAssetId} → ${targetAssetId} (${relationshipType}) already exists.`,
      );
    }
  }
}
