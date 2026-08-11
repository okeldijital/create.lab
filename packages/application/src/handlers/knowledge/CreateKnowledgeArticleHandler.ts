import {
  KnowledgeArticleService,
  type KnowledgeArticleServiceDeps,
  asKnowledgeCategoryId,
} from "@creative-lab/knowledge";
import type { CreateKnowledgeArticleCommand } from "../../commands/knowledge/CreateKnowledgeArticleCommand.js";
import type { KnowledgeArticleDto } from "../../dto/common.js";
import type { CommandHandler } from "../../interfaces/Handler.js";
import { KnowledgeMapper } from "../../mappers/KnowledgeMapper.js";
import type { CollectingEventPublisher } from "../../services/CollectingEventPublisher.js";
import type { ApplicationContext } from "../../types/context.js";
import { validateRequired } from "../../validators/CommandValidator.js";

export type CreateKnowledgeArticleHandlerDeps = Omit<
  KnowledgeArticleServiceDeps,
  "eventPublisher"
> & {
  eventPublisher: CollectingEventPublisher;
};

export class CreateKnowledgeArticleHandler
  implements
    CommandHandler<CreateKnowledgeArticleCommand, KnowledgeArticleDto>
{
  readonly commandType = "CreateKnowledgeArticle" as const;
  private readonly service: KnowledgeArticleService;

  constructor(deps: CreateKnowledgeArticleHandlerDeps) {
    this.service = new KnowledgeArticleService(deps);
  }

  async handle(
    command: CreateKnowledgeArticleCommand,
    context: ApplicationContext,
  ): Promise<KnowledgeArticleDto> {
    validateRequired(command, ["title", "categoryId"]);
    const article = await this.service.create({
      organizationId: context.organizationId,
      title: command.title,
      description: command.description,
      categoryId: asKnowledgeCategoryId(command.categoryId),
      articleNumber: command.articleNumber,
    });
    return KnowledgeMapper.toDto(article);
  }
}
