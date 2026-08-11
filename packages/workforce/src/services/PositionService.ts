import type { OrganizationId } from "@creative-lab/organization";
import type { OrganizationRepository } from "@creative-lab/organization";
import { OrganizationNotFoundError } from "@creative-lab/organization";
import { Position } from "../aggregates/Position/Position.js";
import type { CreatePositionProps } from "../aggregates/Position/Position.js";
import type { PositionStatus } from "../enums/PositionStatus.js";
import {
  DuplicatePositionError,
  PositionNotFoundError,
} from "../errors/WorkforceErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { WorkerAssignmentPolicy } from "../policies/WorkerAssignmentPolicy.js";
import type { PositionRepository } from "../repositories/PositionRepository.js";
import type { PositionId } from "../types/ids.js";

export type PositionServiceDeps = {
  positionRepository: PositionRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class PositionService {
  constructor(private readonly deps: PositionServiceDeps) {}

  async create(props: CreatePositionProps): Promise<Position> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    WorkerAssignmentPolicy.assertOrganizationActive(organization);

    if (
      await this.deps.positionRepository.existsByTitle(
        props.organizationId,
        props.title.trim(),
      )
    ) {
      throw new DuplicatePositionError(
        props.title.trim(),
        props.organizationId,
      );
    }

    const position = Position.create(props);
    await this.deps.positionRepository.save(position);
    await this.deps.eventPublisher.publish(position.pullDomainEvents());
    return position;
  }

  async getById(id: PositionId): Promise<Position> {
    const position = await this.deps.positionRepository.findById(id);
    if (!position) throw new PositionNotFoundError(id);
    return position;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Position[]> {
    return this.deps.positionRepository.findByOrganization(organizationId);
  }

  async update(
    id: PositionId,
    props: {
      title?: string;
      description?: string | null;
      grade?: string | null;
      status?: PositionStatus;
      now?: Date;
    },
  ): Promise<Position> {
    const position = await this.getById(id);
    if (props.title !== undefined) {
      const existing = await this.deps.positionRepository.findByTitle(
        position.organizationId,
        props.title.trim(),
      );
      if (existing && existing.id !== position.id) {
        throw new DuplicatePositionError(
          props.title.trim(),
          position.organizationId,
        );
      }
    }
    position.update(props);
    if (position.isArchived) {
      await this.deps.positionRepository.archive(id);
    } else {
      await this.deps.positionRepository.update(position);
    }
    await this.deps.eventPublisher.publish(position.pullDomainEvents());
    return position;
  }

  async archive(id: PositionId, now?: Date): Promise<Position> {
    const position = await this.getById(id);
    position.archive(now);
    await this.deps.positionRepository.archive(id);
    await this.deps.eventPublisher.publish(position.pullDomainEvents());
    return position;
  }
}
