import {
  KnowledgeArticle,
  type CreateKnowledgeArticleProps,
} from "../aggregates/KnowledgeArticle/KnowledgeArticle.js";
import {
  KnowledgeVersion,
  type CreateKnowledgeVersionProps,
} from "../aggregates/KnowledgeVersion/KnowledgeVersion.js";
import {
  KnowledgeCategory,
  type CreateKnowledgeCategoryProps,
} from "../aggregates/KnowledgeCategory/KnowledgeCategory.js";
import {
  KnowledgeReference,
  type CreateKnowledgeReferenceProps,
} from "../aggregates/KnowledgeReference/KnowledgeReference.js";

export const KnowledgeArticleFactory = {
  create: (props: CreateKnowledgeArticleProps) =>
    KnowledgeArticle.create(props),
  reconstitute: KnowledgeArticle.reconstitute.bind(KnowledgeArticle),
};

export const KnowledgeVersionFactory = {
  create: (props: CreateKnowledgeVersionProps) =>
    KnowledgeVersion.create(props),
  reconstitute: KnowledgeVersion.reconstitute.bind(KnowledgeVersion),
};

export const KnowledgeCategoryFactory = {
  create: (props: CreateKnowledgeCategoryProps) =>
    KnowledgeCategory.create(props),
  reconstitute: KnowledgeCategory.reconstitute.bind(KnowledgeCategory),
};

export const KnowledgeReferenceFactory = {
  create: (props: CreateKnowledgeReferenceProps) =>
    KnowledgeReference.create(props),
  reconstitute: KnowledgeReference.reconstitute.bind(KnowledgeReference),
};
