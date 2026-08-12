import type { DrizzleDatabase } from "@creative-lab/infrastructure";
import {
  PostgresKnowledgeArticleRepository,
  PostgresKnowledgeCategoryRepository,
  PostgresKnowledgeReferenceRepository,
  PostgresKnowledgeVersionRepository,
} from "@creative-lab/infrastructure";
import type { ApplicationComposition } from "./ApplicationComposition.js";

export const KNOWLEDGE_REPOSITORY_KEYS = {
  article: "knowledgeArticle",
  version: "knowledgeVersion",
  category: "knowledgeCategory",
  reference: "knowledgeReference",
} as const;

export function registerPostgresKnowledgeRepositories(
  composition: ApplicationComposition,
  database: DrizzleDatabase,
): void {
  composition.repositories.register(KNOWLEDGE_REPOSITORY_KEYS.article, new PostgresKnowledgeArticleRepository(database));
  composition.repositories.register(KNOWLEDGE_REPOSITORY_KEYS.version, new PostgresKnowledgeVersionRepository(database));
  composition.repositories.register(KNOWLEDGE_REPOSITORY_KEYS.category, new PostgresKnowledgeCategoryRepository(database));
  composition.repositories.register(KNOWLEDGE_REPOSITORY_KEYS.reference, new PostgresKnowledgeReferenceRepository(database));
}
