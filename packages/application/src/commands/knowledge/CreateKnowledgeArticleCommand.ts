import type { Command } from "../Command.js";

export type CreateKnowledgeArticleCommand =
  Command<"CreateKnowledgeArticle"> & {
    readonly title: string;
    readonly categoryId: string;
    readonly description?: string | null;
    readonly articleNumber?: string;
  };

export function createKnowledgeArticleCommand(
  input: Omit<CreateKnowledgeArticleCommand, "type">,
): CreateKnowledgeArticleCommand {
  return { type: "CreateKnowledgeArticle", ...input } as CreateKnowledgeArticleCommand;
}
