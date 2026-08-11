import { Department } from "../aggregates/Department/Department.js";
import type { CreateDepartmentProps } from "../aggregates/Department/Department.js";
import type { DepartmentStatus } from "../enums/DepartmentStatus.js";
import {
  DepartmentNotFoundError,
  DuplicateDepartmentError,
} from "../errors/DepartmentErrors.js";
import { OrganizationNotFoundError } from "../errors/OrganizationErrors.js";
import type { DomainEventPublisher } from "../interfaces/DomainEventPublisher.js";
import { DepartmentHierarchyPolicy } from "../policies/DepartmentHierarchyPolicy.js";
import { OrganizationActivationPolicy } from "../policies/OrganizationActivationPolicy.js";
import type { DepartmentRepository } from "../repositories/DepartmentRepository.js";
import type { OrganizationRepository } from "../repositories/OrganizationRepository.js";
import type { DepartmentId, OrganizationId } from "../types/ids.js";

export type DepartmentServiceDeps = {
  departmentRepository: DepartmentRepository;
  organizationRepository: OrganizationRepository;
  eventPublisher: DomainEventPublisher;
  maxDepartmentDepth?: number;
};

export class DepartmentService {
  constructor(private readonly deps: DepartmentServiceDeps) {}

  async create(props: CreateDepartmentProps): Promise<Department> {
    const organization = await this.deps.organizationRepository.findById(
      props.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(props.organizationId);
    }
    OrganizationActivationPolicy.assertOperational(organization);

    if (
      await this.deps.departmentRepository.existsByNameInOrganization(
        props.organizationId,
        props.name.trim(),
      )
    ) {
      throw new DuplicateDepartmentError(
        props.name.trim(),
        props.organizationId,
      );
    }

    const siblings = await this.deps.departmentRepository.findByOrganizationId(
      props.organizationId,
    );
    const nodes = DepartmentHierarchyPolicy.fromDepartments(siblings);

    // Temporary id for pre-create validation when parent is set
    const provisionalId = (props.id ??
      "00000000-0000-4000-8000-000000000000") as DepartmentId;

    if (props.parentDepartmentId) {
      DepartmentHierarchyPolicy.assertValidParent({
        departmentId: provisionalId,
        organizationId: props.organizationId,
        parentDepartmentId: props.parentDepartmentId,
        departments: nodes,
      });
      DepartmentHierarchyPolicy.assertWithinDepth({
        departmentId: provisionalId,
        parentDepartmentId: props.parentDepartmentId,
        departments: nodes,
        maxDepth: this.deps.maxDepartmentDepth ?? 10,
      });
    }

    const department = Department.create(props);

    if (props.parentDepartmentId) {
      DepartmentHierarchyPolicy.assertValidParent({
        departmentId: department.id,
        organizationId: props.organizationId,
        parentDepartmentId: props.parentDepartmentId,
        departments: [
          ...nodes,
          {
            id: department.id,
            organizationId: department.organizationId,
            parentDepartmentId: department.parentDepartmentId,
          },
        ],
      });
    }

    await this.deps.departmentRepository.save(department);
    await this.deps.eventPublisher.publish(department.pullDomainEvents());
    return department;
  }

  async getById(id: DepartmentId): Promise<Department> {
    const department = await this.deps.departmentRepository.findById(id);
    if (!department) {
      throw new DepartmentNotFoundError(id);
    }
    return department;
  }

  async listByOrganization(
    organizationId: OrganizationId,
  ): Promise<Department[]> {
    return this.deps.departmentRepository.findByOrganizationId(organizationId);
  }

  async update(
    id: DepartmentId,
    props: {
      name?: string;
      description?: string | null;
      parentDepartmentId?: DepartmentId | null;
      headId?: string | null;
      status?: DepartmentStatus;
      now?: Date;
    },
  ): Promise<Department> {
    const department = await this.getById(id);
    const organization = await this.deps.organizationRepository.findById(
      department.organizationId,
    );
    if (!organization) {
      throw new OrganizationNotFoundError(department.organizationId);
    }
    OrganizationActivationPolicy.assertOperational(organization);

    if (props.name !== undefined) {
      const existing =
        await this.deps.departmentRepository.findByNameInOrganization(
          department.organizationId,
          props.name.trim(),
        );
      if (existing && existing.id !== department.id) {
        throw new DuplicateDepartmentError(
          props.name.trim(),
          department.organizationId,
        );
      }
    }

    const siblings = await this.deps.departmentRepository.findByOrganizationId(
      department.organizationId,
    );
    const projectedNodes = siblings.map((d) => ({
      id: d.id,
      organizationId: d.organizationId,
      parentDepartmentId:
        d.id === department.id && props.parentDepartmentId !== undefined
          ? props.parentDepartmentId
          : d.parentDepartmentId,
    }));

    if (props.parentDepartmentId !== undefined) {
      DepartmentHierarchyPolicy.assertValidParent({
        departmentId: department.id,
        organizationId: department.organizationId,
        parentDepartmentId: props.parentDepartmentId,
        departments: projectedNodes,
      });
      DepartmentHierarchyPolicy.assertWithinDepth({
        departmentId: department.id,
        parentDepartmentId: props.parentDepartmentId,
        departments: projectedNodes,
        maxDepth: this.deps.maxDepartmentDepth ?? 10,
      });
    }

    department.update(props);
    await this.deps.departmentRepository.update(department);
    await this.deps.eventPublisher.publish(department.pullDomainEvents());
    return department;
  }

  async archive(id: DepartmentId, now?: Date): Promise<Department> {
    const department = await this.getById(id);
    department.archive(now);
    await this.deps.departmentRepository.archive(id);
    await this.deps.eventPublisher.publish(department.pullDomainEvents());
    return department;
  }
}
