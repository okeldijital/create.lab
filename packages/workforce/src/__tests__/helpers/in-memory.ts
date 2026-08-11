import {
  Department,
  Organization,
  Team,
  type DepartmentId,
  type DepartmentRepository,
  type OrganizationId,
  type OrganizationRepository,
  type OrganizationSlug,
  type TeamId,
  type TeamRepository,
} from "@creative-lab/organization";
import type { Employment } from "../../aggregates/Employment/Employment.js";
import type { EmploymentContract } from "../../aggregates/EmploymentContract/EmploymentContract.js";
import type { Position } from "../../aggregates/Position/Position.js";
import type { ReportingRelationship } from "../../aggregates/ReportingRelationship/ReportingRelationship.js";
import type { Worker } from "../../aggregates/Worker/Worker.js";
import type { AnyDomainEvent } from "@creative-lab/core";
import type { DomainEventPublisher } from "../../interfaces/DomainEventPublisher.js";
import type { EmploymentContractRepository } from "../../repositories/EmploymentContractRepository.js";
import type { EmploymentRepository } from "../../repositories/EmploymentRepository.js";
import type { PositionRepository } from "../../repositories/PositionRepository.js";
import type { ReportingRelationshipRepository } from "../../repositories/ReportingRelationshipRepository.js";
import type { WorkerRepository } from "../../repositories/WorkerRepository.js";
import type {
  EmploymentContractId,
  EmploymentId,
  PositionId,
  ReportingRelationshipId,
  WorkerId,
} from "../../types/ids.js";
import { isActiveEmploymentStatus } from "../../enums/EmploymentStatus.js";

export class InMemoryEventPublisher implements DomainEventPublisher {
  readonly events: AnyDomainEvent[] = [];
  async publish(events: readonly AnyDomainEvent[]): Promise<void> {
    this.events.push(...events);
  }
  clear(): void {
    this.events.length = 0;
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();
  async findById(id: OrganizationId): Promise<Organization | null> {
    return this.byId.get(id) ?? null;
  }
  async findBySlug(
    slug: OrganizationSlug | string,
  ): Promise<Organization | null> {
    const value = typeof slug === "string" ? slug : slug.value;
    for (const o of this.byId.values()) {
      if (o.slug.value === value) return o;
    }
    return null;
  }
  async findAll(): Promise<Organization[]> {
    return [...this.byId.values()];
  }
  async save(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async update(o: Organization): Promise<void> {
    this.byId.set(o.id, o);
  }
  async archive(id: OrganizationId): Promise<void> {
    void id;
  }
  async exists(id: OrganizationId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsBySlug(slug: OrganizationSlug | string): Promise<boolean> {
    return (await this.findBySlug(slug)) !== null;
  }
  async delete(id: OrganizationId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryDepartmentRepository implements DepartmentRepository {
  private readonly byId = new Map<string, Department>();
  async findById(id: DepartmentId): Promise<Department | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganizationId(organizationId: OrganizationId): Promise<Department[]> {
    return [...this.byId.values()].filter((d) => d.organizationId === organizationId);
  }
  async findByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<Department | null> {
    const t = name.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (d) =>
          d.organizationId === organizationId &&
          d.name.value.toLowerCase() === t,
      ) ?? null
    );
  }
  async findAll(): Promise<Department[]> {
    return [...this.byId.values()];
  }
  async save(d: Department): Promise<void> {
    this.byId.set(d.id, d);
  }
  async update(d: Department): Promise<void> {
    this.byId.set(d.id, d);
  }
  async archive(id: DepartmentId): Promise<void> {
    void id;
  }
  async exists(id: DepartmentId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsByNameInOrganization(
    organizationId: OrganizationId,
    name: string,
  ): Promise<boolean> {
    return (await this.findByNameInOrganization(organizationId, name)) !== null;
  }
  async delete(id: DepartmentId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryTeamRepository implements TeamRepository {
  private readonly byId = new Map<string, Team>();
  async findById(id: TeamId): Promise<Team | null> {
    return this.byId.get(id) ?? null;
  }
  async findByOrganizationId(organizationId: OrganizationId): Promise<Team[]> {
    return [...this.byId.values()].filter((t) => t.organizationId === organizationId);
  }
  async findByDepartmentId(departmentId: DepartmentId): Promise<Team[]> {
    return [...this.byId.values()].filter((t) => t.departmentId === departmentId);
  }
  async findByNameInDepartment(
    departmentId: DepartmentId,
    name: string,
  ): Promise<Team | null> {
    const t = name.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (x) =>
          x.departmentId === departmentId && x.name.value.toLowerCase() === t,
      ) ?? null
    );
  }
  async findAll(): Promise<Team[]> {
    return [...this.byId.values()];
  }
  async save(team: Team): Promise<void> {
    this.byId.set(team.id, team);
  }
  async update(team: Team): Promise<void> {
    this.byId.set(team.id, team);
  }
  async archive(id: TeamId): Promise<void> {
    void id;
  }
  async exists(id: TeamId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsByNameInDepartment(
    departmentId: DepartmentId,
    name: string,
  ): Promise<boolean> {
    return (await this.findByNameInDepartment(departmentId, name)) !== null;
  }
  async delete(id: TeamId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryWorkerRepository implements WorkerRepository {
  private readonly byId = new Map<string, Worker>();
  async findById(id: WorkerId): Promise<Worker | null> {
    return this.byId.get(id) ?? null;
  }
  async findAll(): Promise<Worker[]> {
    return [...this.byId.values()];
  }
  async findByOrganization(organizationId: OrganizationId): Promise<Worker[]> {
    return [...this.byId.values()].filter((w) => w.organizationId === organizationId);
  }
  async findByEmail(
    organizationId: OrganizationId,
    email: string,
  ): Promise<Worker | null> {
    const t = email.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (w) => w.organizationId === organizationId && w.email.value === t,
      ) ?? null
    );
  }
  async findByEmployeeNumber(
    organizationId: OrganizationId,
    employeeNumber: string,
  ): Promise<Worker | null> {
    const t = employeeNumber.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (w) =>
          w.organizationId === organizationId &&
          w.employeeNumber.value.toLowerCase() === t,
      ) ?? null
    );
  }
  async save(worker: Worker): Promise<void> {
    this.byId.set(worker.id, worker);
  }
  async update(worker: Worker): Promise<void> {
    this.byId.set(worker.id, worker);
  }
  async archive(id: WorkerId): Promise<void> {
    void id;
  }
  async exists(id: WorkerId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsByEmail(
    organizationId: OrganizationId,
    email: string,
  ): Promise<boolean> {
    return (await this.findByEmail(organizationId, email)) !== null;
  }
  async existsByEmployeeNumber(
    organizationId: OrganizationId,
    employeeNumber: string,
  ): Promise<boolean> {
    return (
      (await this.findByEmployeeNumber(organizationId, employeeNumber)) !== null
    );
  }
  async delete(id: WorkerId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryPositionRepository implements PositionRepository {
  private readonly byId = new Map<string, Position>();
  async findById(id: PositionId): Promise<Position | null> {
    return this.byId.get(id) ?? null;
  }
  async findAll(): Promise<Position[]> {
    return [...this.byId.values()];
  }
  async findByOrganization(organizationId: OrganizationId): Promise<Position[]> {
    return [...this.byId.values()].filter((p) => p.organizationId === organizationId);
  }
  async findByTitle(
    organizationId: OrganizationId,
    title: string,
  ): Promise<Position | null> {
    const t = title.trim().toLowerCase();
    return (
      [...this.byId.values()].find(
        (p) =>
          p.organizationId === organizationId &&
          p.title.value.toLowerCase() === t,
      ) ?? null
    );
  }
  async save(position: Position): Promise<void> {
    this.byId.set(position.id, position);
  }
  async update(position: Position): Promise<void> {
    this.byId.set(position.id, position);
  }
  async archive(id: PositionId): Promise<void> {
    void id;
  }
  async exists(id: PositionId): Promise<boolean> {
    return this.byId.has(id);
  }
  async existsByTitle(
    organizationId: OrganizationId,
    title: string,
  ): Promise<boolean> {
    return (await this.findByTitle(organizationId, title)) !== null;
  }
  async delete(id: PositionId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryEmploymentRepository implements EmploymentRepository {
  private readonly byId = new Map<string, Employment>();
  async findById(id: EmploymentId): Promise<Employment | null> {
    return this.byId.get(id) ?? null;
  }
  async findAll(): Promise<Employment[]> {
    return [...this.byId.values()];
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Employment[]> {
    return [...this.byId.values()].filter(
      (e) => e.organizationId === organizationId,
    );
  }
  async findByWorker(workerId: WorkerId): Promise<Employment[]> {
    return [...this.byId.values()].filter((e) => e.workerId === workerId);
  }
  async findActiveByWorker(workerId: WorkerId): Promise<Employment | null> {
    return (
      [...this.byId.values()].find(
        (e) => e.workerId === workerId && isActiveEmploymentStatus(e.status),
      ) ?? null
    );
  }
  async save(employment: Employment): Promise<void> {
    this.byId.set(employment.id, employment);
  }
  async update(employment: Employment): Promise<void> {
    this.byId.set(employment.id, employment);
  }
  async archive(id: EmploymentId): Promise<void> {
    void id;
  }
  async exists(id: EmploymentId): Promise<boolean> {
    return this.byId.has(id);
  }
  async delete(id: EmploymentId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryEmploymentContractRepository
  implements EmploymentContractRepository
{
  private readonly byId = new Map<string, EmploymentContract>();
  async findById(id: EmploymentContractId): Promise<EmploymentContract | null> {
    return this.byId.get(id) ?? null;
  }
  async findAll(): Promise<EmploymentContract[]> {
    return [...this.byId.values()];
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<EmploymentContract[]> {
    return [...this.byId.values()].filter(
      (c) => c.organizationId === organizationId,
    );
  }
  async findByEmployment(
    employmentId: EmploymentId,
  ): Promise<EmploymentContract[]> {
    return [...this.byId.values()].filter((c) => c.employmentId === employmentId);
  }
  async findActiveByEmployment(
    employmentId: EmploymentId,
  ): Promise<EmploymentContract | null> {
    return (
      [...this.byId.values()].find(
        (c) => c.employmentId === employmentId && c.isActive,
      ) ?? null
    );
  }
  async save(contract: EmploymentContract): Promise<void> {
    this.byId.set(contract.id, contract);
  }
  async update(contract: EmploymentContract): Promise<void> {
    this.byId.set(contract.id, contract);
  }
  async archive(id: EmploymentContractId): Promise<void> {
    void id;
  }
  async exists(id: EmploymentContractId): Promise<boolean> {
    return this.byId.has(id);
  }
  async delete(id: EmploymentContractId): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryReportingRelationshipRepository
  implements ReportingRelationshipRepository
{
  private readonly byId = new Map<string, ReportingRelationship>();
  async findById(
    id: ReportingRelationshipId,
  ): Promise<ReportingRelationship | null> {
    return this.byId.get(id) ?? null;
  }
  async findAll(): Promise<ReportingRelationship[]> {
    return [...this.byId.values()];
  }
  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<ReportingRelationship[]> {
    return [...this.byId.values()].filter(
      (r) => r.organizationId === organizationId,
    );
  }
  async findActiveByWorker(
    workerId: WorkerId,
  ): Promise<ReportingRelationship | null> {
    return (
      [...this.byId.values()].find(
        (r) => r.workerId === workerId && r.isActive,
      ) ?? null
    );
  }
  async findActiveByManager(
    managerId: WorkerId,
  ): Promise<ReportingRelationship[]> {
    return [...this.byId.values()].filter(
      (r) => r.managerId === managerId && r.isActive,
    );
  }
  async save(relationship: ReportingRelationship): Promise<void> {
    this.byId.set(relationship.id, relationship);
  }
  async update(relationship: ReportingRelationship): Promise<void> {
    this.byId.set(relationship.id, relationship);
  }
  async archive(id: ReportingRelationshipId): Promise<void> {
    void id;
  }
  async exists(id: ReportingRelationshipId): Promise<boolean> {
    return this.byId.has(id);
  }
  async delete(id: ReportingRelationshipId): Promise<void> {
    this.byId.delete(id);
  }
}

/** Seed an org + department for workforce service tests. */
export async function seedOrgStructure(repos: {
  orgs: InMemoryOrganizationRepository;
  depts: InMemoryDepartmentRepository;
  teams?: InMemoryTeamRepository;
}): Promise<{ organization: Organization; department: Department; team?: Team }> {
  const organization = Organization.create({
    name: "Acme Creative",
    slug: "acme-creative",
  });
  organization.pullDomainEvents();
  await repos.orgs.save(organization);
  const department = Department.create({
    organizationId: organization.id,
    name: "Production",
  });
  department.pullDomainEvents();
  await repos.depts.save(department);
  let team: Team | undefined;
  if (repos.teams) {
    team = Team.create({
      organizationId: organization.id,
      departmentId: department.id,
      name: "Mastering Team",
    });
    team.pullDomainEvents();
    await repos.teams.save(team);
  }
  return { organization, department, team };
}
