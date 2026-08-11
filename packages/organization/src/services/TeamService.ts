import { Team } from "../aggregates/Team/Team.js";
import type { CreateTeamProps } from "../aggregates/Team/Team.js";
import type { TeamStatus } from "../enums/TeamStatus.js";
import {
  DepartmentNotFoundError,
  DepartmentValidationError,
} from "../errors/DepartmentErrors.js";
import { OrganizationNotFoundError } from "../errors/OrganizationErrors.js";
import {
  DuplicateTeamError,
  TeamNotFoundError,
} from "../errors/TeamErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { OrganizationActivationPolicy } from "../policies/OrganizationActivationPolicy.js";
import type { DepartmentRepository } from "../repositories/DepartmentRepository.js";
import type { OrganizationRepository } from "../repositories/OrganizationRepository.js";
import type { TeamRepository } from "../repositories/TeamRepository.js";
import type { DepartmentId, OrganizationId, TeamId } from "../types/ids.js";

export type TeamServiceDeps = {
  teamRepository: TeamRepository;
  departmentRepository: DepartmentRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
};

export class TeamService {
  constructor(private readonly deps: TeamServiceDeps) {}

  async create(props: CreateTeamProps): Promise<Team> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    OrganizationActivationPolicy.assertOperational(organization);

    const department = await this.deps.departmentRepository.findById(
      props.departmentId,
    );
    if (!department) {
      throw new DepartmentNotFoundError(props.departmentId);
    }
    if (department.organizationId !== props.organizationId) {
      throw new DepartmentValidationError(
        "Department and Team must belong to the same organization.",
      );
    }

    if (
      await this.deps.teamRepository.existsByNameInDepartment(
        props.departmentId,
        props.name.trim(),
      )
    ) {
      throw new DuplicateTeamError(props.name.trim(), props.departmentId);
    }

    const team = Team.create(props);
    await this.deps.teamRepository.save(team);
    await this.deps.eventPublisher.publish(team.pullDomainEvents());
    return team;
  }

  async getById(id: TeamId): Promise<Team> {
    const team = await this.deps.teamRepository.findById(id);
    if (!team) {
      throw new TeamNotFoundError(id);
    }
    return team;
  }

  async listByOrganization(organizationId: OrganizationId): Promise<Team[]> {
    return this.deps.teamRepository.findByOrganizationId(organizationId);
  }

  async listByDepartment(departmentId: DepartmentId): Promise<Team[]> {
    return this.deps.teamRepository.findByDepartmentId(departmentId);
  }

  async update(
    id: TeamId,
    props: {
      name?: string;
      description?: string | null;
      departmentId?: DepartmentId;
      status?: TeamStatus;
      now?: Date;
    },
  ): Promise<Team> {
    const team = await this.getById(id);
    const organization = await this.deps.organizationRepository.findById(
      team.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(team.organizationId);
    }
    OrganizationActivationPolicy.assertOperational(organization);

    const targetDepartmentId = props.departmentId ?? team.departmentId;
    if (props.departmentId !== undefined) {
      const department = await this.deps.departmentRepository.findById(
        props.departmentId,
      );
      if (!department) {
        throw new DepartmentNotFoundError(props.departmentId);
      }
      if (department.organizationId !== team.organizationId) {
        throw new DepartmentValidationError(
          "Department and Team must belong to the same organization.",
        );
      }
    }

    if (props.name !== undefined) {
      const existing = await this.deps.teamRepository.findByNameInDepartment(
        targetDepartmentId,
        props.name.trim(),
      );
      if (existing && existing.id !== team.id) {
        throw new DuplicateTeamError(props.name.trim(), targetDepartmentId);
      }
    }

    team.update(props);
    await this.deps.teamRepository.update(team);
    await this.deps.eventPublisher.publish(team.pullDomainEvents());
    return team;
  }

  async archive(id: TeamId, now?: Date): Promise<Team> {
    const team = await this.getById(id);
    team.archive(now);
    await this.deps.teamRepository.archive(id);
    await this.deps.eventPublisher.publish(team.pullDomainEvents());
    return team;
  }
}
