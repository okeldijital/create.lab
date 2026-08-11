import type {
  DepartmentId,
  OrganizationId,
  TeamId,
} from "@creative-lab/organization";
import type {
  DepartmentRepository,
  OrganizationRepository,
  TeamRepository,
} from "@creative-lab/organization";
import {
  DepartmentNotFoundError,
  OrganizationNotFoundError,
  TeamNotFoundError,
} from "@creative-lab/organization";
import { Worker } from "../aggregates/Worker/Worker.js";
import type { CreateWorkerProps } from "../aggregates/Worker/Worker.js";
import type { WorkerStatus } from "../enums/WorkerStatus.js";
import {
  DuplicateEmailError,
  DuplicateEmployeeNumberError,
  PositionNotFoundError,
  WorkerNotFoundError,
} from "../errors/WorkforceErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import {
  PositionAssignmentPolicy,
  ReportingHierarchyPolicy,
  WorkerAssignmentPolicy,
} from "../policies/index.js";
import type { PositionRepository } from "../repositories/PositionRepository.js";
import type { WorkerRepository } from "../repositories/WorkerRepository.js";
import type { PositionId, WorkerId } from "../types/ids.js";

export type WorkerServiceDeps = {
  workerRepository: WorkerRepository;
  organizationRepository: OrganizationRepository;
  departmentRepository: DepartmentRepository;
  teamRepository: TeamRepository;
  positionRepository: PositionRepository;
  eventPublisher: DomainEventPublisher;
};

export class WorkerService {
  constructor(private readonly deps: WorkerServiceDeps) {}

  async create(props: CreateWorkerProps): Promise<Worker> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    WorkerAssignmentPolicy.assertOrganizationActive(organization);

    const department = await this.deps.departmentRepository.findById(
      props.departmentId,
    );
    if (!department) {
      throw new DepartmentNotFoundError(props.departmentId);
    }
    WorkerAssignmentPolicy.assertDepartmentInOrganization(
      department,
      props.organizationId,
    );

    if (props.teamId) {
      const team = await this.deps.teamRepository.findById(props.teamId);
      if (!team) {
        throw new TeamNotFoundError(props.teamId);
      }
      WorkerAssignmentPolicy.assertTeamInOrganization(
        team,
        props.organizationId,
        props.departmentId,
      );
    }

    if (props.positionId) {
      const position = await this.deps.positionRepository.findById(
        props.positionId,
      );
      if (!position) {
        throw new PositionNotFoundError(props.positionId);
      }
      PositionAssignmentPolicy.assertAssignable(
        position,
        props.organizationId,
      );
    }

    if (props.managerId) {
      const manager = await this.deps.workerRepository.findById(
        props.managerId,
      );
      if (!manager) {
        throw new WorkerNotFoundError(props.managerId);
      }
      WorkerAssignmentPolicy.assertManagerInOrganization(
        manager,
        props.organizationId,
        (props.id as WorkerId) ?? ("__new__" as WorkerId),
      );
      if (props.id) {
        const peers = await this.deps.workerRepository.findByOrganization(
          props.organizationId,
        );
        ReportingHierarchyPolicy.assertValidAssignment({
          workerId: props.id as WorkerId,
          managerId: props.managerId,
          organizationId: props.organizationId,
          nodes: peers.map((w) => ({
            workerId: w.id,
            managerId: w.managerId,
            organizationId: w.organizationId,
          })),
        });
      }
    }

    const email = props.email.trim().toLowerCase();
    if (
      await this.deps.workerRepository.existsByEmail(
        props.organizationId,
        email,
      )
    ) {
      throw new DuplicateEmailError(email, props.organizationId);
    }
    if (
      await this.deps.workerRepository.existsByEmployeeNumber(
        props.organizationId,
        props.employeeNumber.trim(),
      )
    ) {
      throw new DuplicateEmployeeNumberError(
        props.employeeNumber.trim(),
        props.organizationId,
      );
    }

    const worker = Worker.create(props);

    if (props.managerId) {
      const peers = await this.deps.workerRepository.findByOrganization(
        props.organizationId,
      );
      ReportingHierarchyPolicy.assertValidAssignment({
        workerId: worker.id,
        managerId: props.managerId,
        organizationId: props.organizationId,
        nodes: [
          ...peers.map((w) => ({
            workerId: w.id,
            managerId: w.managerId,
            organizationId: w.organizationId,
          })),
          {
            workerId: worker.id,
            managerId: props.managerId,
            organizationId: worker.organizationId,
          },
        ],
      });
    }

    await this.deps.workerRepository.save(worker);
    await this.deps.eventPublisher.publish(worker.pullDomainEvents());
    return worker;
  }

  async getById(id: WorkerId): Promise<Worker> {
    const worker = await this.deps.workerRepository.findById(id);
    if (!worker) throw new WorkerNotFoundError(id);
    return worker;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Worker[]> {
    return this.deps.workerRepository.findByOrganization(organizationId);
  }

  async update(
    id: WorkerId,
    props: {
      firstName?: string;
      lastName?: string;
      preferredName?: string | null;
      email?: string;
      phone?: string | null;
      departmentId?: DepartmentId;
      teamId?: TeamId | null;
      positionId?: PositionId | null;
      managerId?: WorkerId | null;
      now?: Date;
    },
  ): Promise<Worker> {
    const worker = await this.getById(id);
    const organization = await this.deps.organizationRepository.findById(
      worker.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(worker.organizationId);
    }
    WorkerAssignmentPolicy.assertOrganizationActive(organization);

    if (props.email !== undefined) {
      const existing = await this.deps.workerRepository.findByEmail(
        worker.organizationId,
        props.email.trim().toLowerCase(),
      );
      if (existing && existing.id !== worker.id) {
        throw new DuplicateEmailError(
          props.email.trim().toLowerCase(),
          worker.organizationId,
        );
      }
    }

    const departmentId = props.departmentId ?? worker.departmentId;
    if (props.departmentId) {
      const department = await this.deps.departmentRepository.findById(
        props.departmentId,
      );
      if (!department) {
        throw new DepartmentNotFoundError(props.departmentId);
      }
      WorkerAssignmentPolicy.assertDepartmentInOrganization(
        department,
        worker.organizationId,
      );
    }

    if (props.teamId) {
      const team = await this.deps.teamRepository.findById(props.teamId);
      if (!team) throw new TeamNotFoundError(props.teamId);
      WorkerAssignmentPolicy.assertTeamInOrganization(
        team,
        worker.organizationId,
        departmentId,
      );
    }

    if (props.positionId) {
      const position = await this.deps.positionRepository.findById(
        props.positionId,
      );
      if (!position) {
        throw new PositionNotFoundError(props.positionId);
      }
      PositionAssignmentPolicy.assertAssignable(
        position,
        worker.organizationId,
      );
      PositionAssignmentPolicy.assertWorkerCanReceivePosition(worker);
    }

    if (props.managerId) {
      const manager = await this.deps.workerRepository.findById(
        props.managerId,
      );
      if (!manager) throw new WorkerNotFoundError(props.managerId);
      WorkerAssignmentPolicy.assertManagerInOrganization(
        manager,
        worker.organizationId,
        worker.id,
      );
      const peers = await this.deps.workerRepository.findByOrganization(
        worker.organizationId,
      );
      ReportingHierarchyPolicy.assertValidAssignment({
        workerId: worker.id,
        managerId: props.managerId,
        organizationId: worker.organizationId,
        nodes: peers.map((w) => ({
          workerId: w.id,
          managerId: w.id === worker.id ? props.managerId! : w.managerId,
          organizationId: w.organizationId,
        })),
      });
    }

    worker.update(props);
    await this.deps.workerRepository.update(worker);
    await this.deps.eventPublisher.publish(worker.pullDomainEvents());
    return worker;
  }

  async changeStatus(
    id: WorkerId,
    status: WorkerStatus,
    now?: Date,
  ): Promise<Worker> {
    const worker = await this.getById(id);
    worker.changeStatus(status, now);
    if (worker.isArchived) {
      await this.deps.workerRepository.archive(id);
    } else {
      await this.deps.workerRepository.update(worker);
    }
    await this.deps.eventPublisher.publish(worker.pullDomainEvents());
    return worker;
  }

  async archive(id: WorkerId, now?: Date): Promise<Worker> {
    const worker = await this.getById(id);
    worker.archive(now);
    await this.deps.workerRepository.archive(id);
    await this.deps.eventPublisher.publish(worker.pullDomainEvents());
    return worker;
  }
}
