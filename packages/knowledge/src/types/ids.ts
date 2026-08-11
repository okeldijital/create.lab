declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type KnowledgeArticleId = Brand<string, "KnowledgeArticleId">;
export type KnowledgeVersionId = Brand<string, "KnowledgeVersionId">;
export type KnowledgeCategoryId = Brand<string, "KnowledgeCategoryId">;
export type KnowledgeReferenceId = Brand<string, "KnowledgeReferenceId">;

export function asKnowledgeArticleId(value: string): KnowledgeArticleId {
  return value as KnowledgeArticleId;
}
export function asKnowledgeVersionId(value: string): KnowledgeVersionId {
  return value as KnowledgeVersionId;
}
export function asKnowledgeCategoryId(value: string): KnowledgeCategoryId {
  return value as KnowledgeCategoryId;
}
export function asKnowledgeReferenceId(value: string): KnowledgeReferenceId {
  return value as KnowledgeReferenceId;
}
