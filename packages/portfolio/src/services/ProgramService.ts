import type { EngagementId } from "@creative-lab/engagement";
import type { ProjectId } from "@creative-lab/projects";
import {
  Program,
  type CreateProgramProps,
} from "../aggregates/Program/Program.js";
import { ProgramStatus } from "../enums/ProgramStatus.js";
import {
  PortfolioNotFoundError,
  ProgramNotFoundError,
} from "../errors/PortfolioErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { PortfolioLifecyclePolicy } from "../policies/PortfolioLifecyclePolicy.js";
import { ProgramPolicy } from "../policies/ProgramPolicy.js";
import type { PortfolioRepository } from "../repositories/PortfolioRepository.js";
import type { ProgramRepository } from "../repositories/ProgramRepository.js";
import type { PortfolioId, ProgramId } from "../types/ids.js";

export type ProgramServiceDeps = {
  programRepository: ProgramRepository;
  portfolioRepository: PortfolioRepository;
  eventPublisher: DomainEventPublisher;
};

export type AddProgramProps = {
  organizationId: CreateProgramProps["organizationId"];
  portfolioId: PortfolioId;
  name: string;
  description?: string | null;
  sequence?: number;
  now?: Date;
};

export class ProgramService {
  constructor(private readonly deps: ProgramServiceDeps) {}

  async create(props: AddProgramProps): Promise<Program> {
    const portfolio = await this.deps.portfolioRepository.findById(
      props.portfolioId,
    );
    if (!portfolio) throw new PortfolioNotFoundError(props.portfolioId);
    PortfolioLifecyclePolicy.assertStructurallyEditable(portfolio);

    const existing = await this.deps.programRepository.findByPortfolio(
      props.portfolioId,
    );
    const sequence =
      props.sequence ?? ProgramPolicy.nextSequence(existing);
    ProgramPolicy.assertUniqueSequence(sequence, existing);

    const program = Program.create({
      organizationId: props.organizationId,
      portfolioId: props.portfolioId,
      name: props.name,
      description: props.description,
      sequence,
      now: props.now,
    });
    portfolio.addProgramId(program.id, props.now);

    await this.deps.programRepository.save(program);
    await this.deps.portfolioRepository.update(portfolio);
    await this.deps.eventPublisher.publish([
      ...program.pullDomainEvents(),
      ...portfolio.pullDomainEvents(),
    ]);
    return program;
  }

  async addEngagement(
    programId: ProgramId,
    engagementId: EngagementId,
    now?: Date,
  ): Promise<Program> {
    const program = await this.getById(programId);
    ProgramPolicy.assertEditable(program);
    program.addEngagement(engagementId, now);
    await this.deps.programRepository.update(program);
    await this.deps.eventPublisher.publish(program.pullDomainEvents());
    return program;
  }

  async removeEngagement(
    programId: ProgramId,
    engagementId: EngagementId,
    now?: Date,
  ): Promise<Program> {
    const program = await this.getById(programId);
    ProgramPolicy.assertEditable(program);
    program.removeEngagement(engagementId, now);
    await this.deps.programRepository.update(program);
    await this.deps.eventPublisher.publish(program.pullDomainEvents());
    return program;
  }

  async addProject(
    programId: ProgramId,
    projectId: ProjectId,
    now?: Date,
  ): Promise<Program> {
    const program = await this.getById(programId);
    ProgramPolicy.assertEditable(program);
    program.addProject(projectId, now);
    await this.deps.programRepository.update(program);
    await this.deps.eventPublisher.publish(program.pullDomainEvents());
    return program;
  }

  async removeProject(
    programId: ProgramId,
    projectId: ProjectId,
    now?: Date,
  ): Promise<Program> {
    const program = await this.getById(programId);
    ProgramPolicy.assertEditable(program);
    program.removeProject(projectId, now);
    await this.deps.programRepository.update(program);
    await this.deps.eventPublisher.publish(program.pullDomainEvents());
    return program;
  }

  async activate(id: ProgramId, now?: Date): Promise<Program> {
    const program = await this.getById(id);
    ProgramPolicy.assertEditable(program);
    program.activate(now);
    await this.deps.programRepository.update(program);
    await this.deps.eventPublisher.publish(program.pullDomainEvents());
    return program;
  }

  async complete(id: ProgramId, now?: Date): Promise<Program> {
    const program = await this.getById(id);
    ProgramPolicy.assertEditable(program);
    program.complete(now);
    await this.deps.programRepository.update(program);
    await this.deps.eventPublisher.publish(program.pullDomainEvents());
    return program;
  }

  async archive(id: ProgramId, now?: Date): Promise<Program> {
    const program = await this.getById(id);
    if (program.status !== ProgramStatus.ARCHIVED) {
      program.archive(now);
      await this.deps.programRepository.update(program);
      await this.deps.eventPublisher.publish(program.pullDomainEvents());
    }
    return program;
  }

  async getById(id: ProgramId): Promise<Program> {
    const p = await this.deps.programRepository.findById(id);
    if (!p) throw new ProgramNotFoundError(id);
    return p;
  }

  async listByPortfolio(portfolioId: PortfolioId): Promise<Program[]> {
    const list =
      await this.deps.programRepository.findByPortfolio(portfolioId);
    return list.sort((a, b) => a.sequence - b.sequence);
  }
}
