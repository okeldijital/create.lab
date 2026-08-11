import { describe, expect, it, beforeEach } from "vitest";
import { OrganizationService } from "../../services/OrganizationService.js";
import { DepartmentService } from "../../services/DepartmentService.js";
import { TeamService } from "../../services/TeamService.js";
import { StudioService } from "../../services/StudioService.js";
import { OrganizationSettingsService } from "../../services/OrganizationSettingsService.js";
import { OrganizationStatus } from "../../enums/OrganizationStatus.js";
import { StudioType } from "../../enums/StudioType.js";
import {
  DuplicateOrganizationSlugError,
  OrganizationArchivedError,
  OrganizationNotFoundError,
} from "../../errors/OrganizationErrors.js";
import { DuplicateDepartmentError } from "../../errors/DepartmentErrors.js";
import { DuplicateTeamError } from "../../errors/TeamErrors.js";
import { DuplicateStudioError } from "../../errors/StudioErrors.js";
import { DepartmentHierarchyError } from "../../errors/DepartmentErrors.js";
import {
  InMemoryDepartmentRepository,
  InMemoryEventPublisher,
  InMemoryOrganizationRepository,
  InMemoryOrganizationSettingsRepository,
  InMemoryStudioRepository,
  InMemoryTeamRepository,
} from "../helpers/in-memory.js";
import { OrganizationCreated } from "../../events/organization-events.js";
import { WorkingWeek, Weekday } from "../../value-objects/WorkingWeek.js";
import { WorkingHours } from "../../value-objects/WorkingHours.js";

describe("Domain services", () => {
  let orgs: InMemoryOrganizationRepository;
  let settingsRepo: InMemoryOrganizationSettingsRepository;
  let depts: InMemoryDepartmentRepository;
  let teams: InMemoryTeamRepository;
  let studios: InMemoryStudioRepository;
  let events: InMemoryEventPublisher;
  let organizationService: OrganizationService;
  let departmentService: DepartmentService;
  let teamService: TeamService;
  let studioService: StudioService;
  let settingsService: OrganizationSettingsService;

  beforeEach(() => {
    orgs = new InMemoryOrganizationRepository();
    settingsRepo = new InMemoryOrganizationSettingsRepository();
    depts = new InMemoryDepartmentRepository();
    teams = new InMemoryTeamRepository();
    studios = new InMemoryStudioRepository();
    events = new InMemoryEventPublisher();

    organizationService = new OrganizationService({
      organizationRepository: orgs,
      settingsRepository: settingsRepo,
      eventPublisher: events,
    });
    departmentService = new DepartmentService({
      departmentRepository: depts,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    teamService = new TeamService({
      teamRepository: teams,
      departmentRepository: depts,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    studioService = new StudioService({
      studioRepository: studios,
      organizationRepository: orgs,
      eventPublisher: events,
    });
    settingsService = new OrganizationSettingsService({
      settingsRepository: settingsRepo,
      organizationRepository: orgs,
      eventPublisher: events,
    });
  });

  describe("OrganizationService", () => {
    it("creates organization with settings and publishes events", async () => {
      const { organization, settings } = await organizationService.create({
        name: "Acme Creative",
        slug: "acme-creative",
      });
      expect(organization.slug.value).toBe("acme-creative");
      expect(settings.organizationId).toBe(organization.id);
      expect(events.events.some((e) => e instanceof OrganizationCreated)).toBe(
        true,
      );
    });

    it("rejects duplicate slugs", async () => {
      await organizationService.create({ name: "Acme", slug: "acme" });
      await expect(
        organizationService.create({ name: "Acme 2", slug: "acme" }),
      ).rejects.toBeInstanceOf(DuplicateOrganizationSlugError);
    });

    it("archives and blocks child operations on inactive org", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      await organizationService.archive(organization.id);
      await expect(
        departmentService.create({
          organizationId: organization.id,
          name: "Prod",
        }),
      ).rejects.toBeInstanceOf(OrganizationArchivedError);
    });

    it("throws when not found", async () => {
      await expect(
        organizationService.getById("missing" as never),
      ).rejects.toBeInstanceOf(OrganizationNotFoundError);
    });

    it("changes status with policy", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      const suspended = await organizationService.changeStatus(
        organization.id,
        OrganizationStatus.SUSPENDED,
      );
      expect(suspended.status).toBe(OrganizationStatus.SUSPENDED);
    });
  });

  describe("DepartmentService", () => {
    it("creates unique departments and nested hierarchy", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      const root = await departmentService.create({
        organizationId: organization.id,
        name: "Production",
      });
      const child = await departmentService.create({
        organizationId: organization.id,
        name: "Post",
        parentDepartmentId: root.id,
      });
      expect(child.parentDepartmentId).toBe(root.id);
    });

    it("rejects duplicate names in org", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      await departmentService.create({
        organizationId: organization.id,
        name: "Finance",
      });
      await expect(
        departmentService.create({
          organizationId: organization.id,
          name: "finance",
        }),
      ).rejects.toBeInstanceOf(DuplicateDepartmentError);
    });

    it("rejects circular hierarchy on update", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      const a = await departmentService.create({
        organizationId: organization.id,
        name: "A",
      });
      const b = await departmentService.create({
        organizationId: organization.id,
        name: "B",
        parentDepartmentId: a.id,
      });
      await expect(
        departmentService.update(a.id, { parentDepartmentId: b.id }),
      ).rejects.toBeInstanceOf(DepartmentHierarchyError);
    });
  });

  describe("TeamService", () => {
    it("creates team under department in same org", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      const dept = await departmentService.create({
        organizationId: organization.id,
        name: "Creative",
      });
      const team = await teamService.create({
        organizationId: organization.id,
        departmentId: dept.id,
        name: "Web Team",
      });
      expect(team.departmentId).toBe(dept.id);
    });

    it("rejects duplicate team names in department", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      const dept = await departmentService.create({
        organizationId: organization.id,
        name: "Creative",
      });
      await teamService.create({
        organizationId: organization.id,
        departmentId: dept.id,
        name: "Web Team",
      });
      await expect(
        teamService.create({
          organizationId: organization.id,
          departmentId: dept.id,
          name: "web team",
        }),
      ).rejects.toBeInstanceOf(DuplicateTeamError);
    });
  });

  describe("StudioService", () => {
    it("creates unique studios", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      const studio = await studioService.create({
        organizationId: organization.id,
        name: "Studio A",
        type: StudioType.PHYSICAL,
        capacity: 6,
      });
      expect(studio.capacity).toBe(6);
      await expect(
        studioService.create({
          organizationId: organization.id,
          name: "studio a",
          type: StudioType.VIRTUAL,
          capacity: 1,
        }),
      ).rejects.toBeInstanceOf(DuplicateStudioError);
    });
  });

  describe("OrganizationSettingsService", () => {
    it("updates settings and emits event", async () => {
      const { organization } = await organizationService.create({
        name: "Acme",
        slug: "acme",
      });
      events.clear();
      const updated = await settingsService.update(organization.id, {
        timezone: "America/Los_Angeles",
        workingWeek: WorkingWeek.create([
          Weekday.MONDAY,
          Weekday.TUESDAY,
          Weekday.WEDNESDAY,
        ]),
        workingHours: WorkingHours.create("10:00", "18:00"),
      });
      expect(updated.timezone.value).toBe("America/Los_Angeles");
      expect(updated.workingHours.start).toBe("10:00");
      expect(events.events).toHaveLength(1);
      expect(events.events[0]?.eventType).toBe("OrganizationSettingsUpdated");
    });
  });
});
