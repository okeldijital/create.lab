import { describe, expect, it, beforeEach } from "vitest";
import { EmploymentType } from "../../enums/EmploymentType.js";
import { ContractType } from "../../enums/ContractType.js";
import { WorkerStatus } from "../../enums/WorkerStatus.js";
import {
  ContractConflictError,
  DuplicateEmailError,
  DuplicateEmployeeNumberError,
  EmploymentConflictError,
  ReportingHierarchyError,
  WorkerArchivedError,
} from "../../errors/WorkforceErrors.js";
import { WorkerService } from "../../services/WorkerService.js";
import { PositionService } from "../../services/PositionService.js";
import { EmploymentService } from "../../services/EmploymentService.js";
import { EmploymentContractService } from "../../services/EmploymentContractService.js";
import { ReportingService } from "../../services/ReportingService.js";
import {
  InMemoryDepartmentRepository,
  InMemoryEmploymentContractRepository,
  InMemoryEmploymentRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryPositionRepository,
  InMemoryReportingRelationshipRepository,
  InMemoryTeamRepository,
  InMemoryWorkerRepository,
  seedOrgStructure,
} from "../helpers/in-memory.js";
import { WorkerCreated } from "../../events/worker-events.js";

describe("Workforce services", () => {
  let orgs: InMemoryOrganizationRepository;
  let depts: InMemoryDepartmentRepository;
  let teams: InMemoryTeamRepository;
  let workers: InMemoryWorkerRepository;
  let positions: InMemoryPositionRepository;
  let employments: InMemoryEmploymentRepository;
  let contracts: InMemoryEmploymentContractRepository;
  let reporting: InMemoryReportingRelationshipRepository;
  let events: InMemoryEventPublisher;
  let workerService: WorkerService;
  let positionService: PositionService;
  let employmentService: EmploymentService;
  let contractService: EmploymentContractService;
  let reportingService: ReportingService;

  beforeEach(async () => {
    orgs = new InMemoryOrganizationRepository();
    depts = new InMemoryDepartmentRepository();
    teams = new InMemoryTeamRepository();
    workers = new InMemoryWorkerRepository();
    positions = new InMemoryPositionRepository();
    employments = new InMemoryEmploymentRepository();
    contracts = new InMemoryEmploymentContractRepository();
    reporting = new InMemoryReportingRelationshipRepository();
    events = new InMemoryEventPublisher();

    workerService = new WorkerService({
      workerRepository: workers,
      organizationRepository: orgs,
      departmentRepository: depts,
      teamRepository: teams,
      positionRepository: positions,
      eventPublisher: events,
    });
    positionService = new PositionService({
      positionRepository: positions,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    employmentService = new EmploymentService({
      employmentRepository: employments,
      workerRepository: workers,
      eventPublisher: events,
    });
    contractService = new EmploymentContractService({
      contractRepository: contracts,
      employmentRepository: employments,
      eventPublisher: events,
    });
    reportingService = new ReportingService({
      reportingRepository: reporting,
      workerRepository: workers,
      eventPublisher: events,
    });

    await seedOrgStructure({ orgs, depts, teams });
  });

  async function seed() {
    return seedOrgStructure({ orgs, depts, teams });
  }

  describe("WorkerService", () => {
    it("creates worker and publishes event", async () => {
      const { organization, department, team } = await seed();
      const worker = await workerService.create({
        organizationId: organization.id,
        employeeNumber: "E100",
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@acme.test",
        employmentType: EmploymentType.FULL_TIME,
        departmentId: department.id,
        teamId: team!.id,
      });
      expect(worker.email.value).toBe("grace@acme.test");
      expect(events.events.some((e) => e instanceof WorkerCreated)).toBe(true);
    });

    it("rejects duplicate email and employee number", async () => {
      const { organization, department } = await seed();
      await workerService.create({
        organizationId: organization.id,
        employeeNumber: "E100",
        firstName: "A",
        lastName: "B",
        email: "a@acme.test",
        employmentType: EmploymentType.FULL_TIME,
        departmentId: department.id,
      });
      await expect(
        workerService.create({
          organizationId: organization.id,
          employeeNumber: "E101",
          firstName: "C",
          lastName: "D",
          email: "a@acme.test",
          employmentType: EmploymentType.PART_TIME,
          departmentId: department.id,
        }),
      ).rejects.toBeInstanceOf(DuplicateEmailError);
      await expect(
        workerService.create({
          organizationId: organization.id,
          employeeNumber: "E100",
          firstName: "C",
          lastName: "D",
          email: "c@acme.test",
          employmentType: EmploymentType.PART_TIME,
          departmentId: department.id,
        }),
      ).rejects.toBeInstanceOf(DuplicateEmployeeNumberError);
    });

    it("archives worker", async () => {
      const { organization, department } = await seed();
      const worker = await workerService.create({
        organizationId: organization.id,
        employeeNumber: "E1",
        firstName: "A",
        lastName: "B",
        email: "x@acme.test",
        employmentType: EmploymentType.FULL_TIME,
        departmentId: department.id,
      });
      const archived = await workerService.archive(worker.id);
      expect(archived.status).toBe(WorkerStatus.ARCHIVED);
      await expect(
        workerService.update(worker.id, { firstName: "Nope" }),
      ).rejects.toBeInstanceOf(WorkerArchivedError);
    });
  });

  describe("PositionService", () => {
    it("creates unique positions", async () => {
      const { organization } = await seed();
      const position = await positionService.create({
        organizationId: organization.id,
        title: "Producer",
      });
      expect(position.title.value).toBe("Producer");
      await expect(
        positionService.create({
          organizationId: organization.id,
          title: "producer",
        }),
      ).rejects.toThrow();
    });
  });

  describe("EmploymentService", () => {
    it("starts one active employment and rejects second", async () => {
      const { organization, department } = await seed();
      const worker = await workerService.create({
        organizationId: organization.id,
        employeeNumber: "E1",
        firstName: "A",
        lastName: "B",
        email: "e@acme.test",
        employmentType: EmploymentType.FULL_TIME,
        departmentId: department.id,
      });
      const emp = await employmentService.start({
        workerId: worker.id,
        organizationId: organization.id,
        employmentType: EmploymentType.FULL_TIME,
        startDate: new Date("2024-01-01"),
      });
      expect(emp.isActive).toBe(true);
      await expect(
        employmentService.start({
          workerId: worker.id,
          organizationId: organization.id,
          employmentType: EmploymentType.PART_TIME,
          startDate: new Date("2024-02-01"),
        }),
      ).rejects.toBeInstanceOf(EmploymentConflictError);
    });
  });

  describe("EmploymentContractService", () => {
    it("enforces one active contract", async () => {
      const { organization, department } = await seed();
      const worker = await workerService.create({
        organizationId: organization.id,
        employeeNumber: "E1",
        firstName: "A",
        lastName: "B",
        email: "c@acme.test",
        employmentType: EmploymentType.CONTRACT,
        departmentId: department.id,
      });
      const emp = await employmentService.start({
        workerId: worker.id,
        organizationId: organization.id,
        employmentType: EmploymentType.CONTRACT,
        startDate: new Date("2024-01-01"),
        onProbation: false,
      });
      await contractService.create({
        employmentId: emp.id,
        organizationId: organization.id,
        contractType: ContractType.FIXED_TERM,
        effectiveDate: new Date("2024-01-01"),
        expiryDate: new Date("2025-01-01"),
      });
      await expect(
        contractService.create({
          employmentId: emp.id,
          organizationId: organization.id,
          contractType: ContractType.CONSULTING,
          effectiveDate: new Date("2024-06-01"),
        }),
      ).rejects.toBeInstanceOf(ContractConflictError);
    });
  });

  describe("ReportingService", () => {
    it("assigns manager and prevents cycles", async () => {
      const { organization, department } = await seed();
      const manager = await workerService.create({
        organizationId: organization.id,
        employeeNumber: "M1",
        firstName: "Boss",
        lastName: "One",
        email: "boss@acme.test",
        employmentType: EmploymentType.FULL_TIME,
        departmentId: department.id,
      });
      const worker = await workerService.create({
        organizationId: organization.id,
        employeeNumber: "W1",
        firstName: "Work",
        lastName: "Er",
        email: "work@acme.test",
        employmentType: EmploymentType.FULL_TIME,
        departmentId: department.id,
      });
      const rel = await reportingService.assignManager({
        organizationId: organization.id,
        workerId: worker.id,
        managerId: manager.id,
      });
      expect(rel.managerId).toBe(manager.id);
      const refreshed = await workerService.getById(worker.id);
      expect(refreshed.managerId).toBe(manager.id);

      // Create reverse cycle attempt: manager reports to worker
      await expect(
        reportingService.assignManager({
          organizationId: organization.id,
          workerId: manager.id,
          managerId: worker.id,
        }),
      ).rejects.toBeInstanceOf(ReportingHierarchyError);
    });
  });
});
