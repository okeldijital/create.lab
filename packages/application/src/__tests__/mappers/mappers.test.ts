import { describe, expect, it } from "vitest";
import { asOrganizationId } from "@creative-lab/organization";
import { Organization } from "@creative-lab/organization";
import { Project } from "@creative-lab/projects";
import { Portfolio } from "@creative-lab/portfolio";
import { KnowledgeArticle } from "@creative-lab/knowledge";
import { asKnowledgeCategoryId } from "@creative-lab/knowledge";
import {
  KnowledgeMapper,
  OrganizationMapper,
  PortfolioMapper,
  ProjectMapper,
} from "../../mappers/index.js";

const orgId = asOrganizationId("org-map");

describe("DTO mappers", () => {
  it("OrganizationMapper", () => {
    const o = Organization.create({
      name: "Map Co",
      slug: "map-co",
      id: orgId,
    });
    const dto = OrganizationMapper.toDto(o);
    expect(dto.id).toBe(orgId);
    expect(dto.name).toBe("Map Co");
    expect(dto.slug).toBe("map-co");
    expect(dto.status).toBeTruthy();
  });

  it("ProjectMapper", () => {
    const p = Project.create({
      organizationId: orgId,
      name: "Mapped Project",
      ownerId: "u1",
    });
    const dto = ProjectMapper.toDto(p);
    expect(dto.name).toBe("Mapped Project");
    expect(dto.ownerId).toBe("u1");
    expect(dto.organizationId).toBe(orgId);
  });

  it("PortfolioMapper", () => {
    const p = Portfolio.create({
      organizationId: orgId,
      name: "Mapped Portfolio",
      startDate: new Date("2026-01-01"),
      portfolioNumber: "PFO-MAP",
    });
    const dto = PortfolioMapper.toDto(p);
    expect(dto.portfolioNumber).toBe("PFO-MAP");
    expect(dto.startDate).toContain("2026");
  });

  it("KnowledgeMapper", () => {
    const a = KnowledgeArticle.create({
      organizationId: orgId,
      title: "Mapped Article",
      categoryId: asKnowledgeCategoryId("cat-1"),
      articleNumber: "K-MAP",
    });
    const dto = KnowledgeMapper.toDto(a);
    expect(dto.title).toBe("Mapped Article");
    expect(dto.articleNumber).toBe("K-MAP");
    expect(dto.categoryId).toBe("cat-1");
  });

  it("mappers do not expose aggregate methods", () => {
    const o = Organization.create({ name: "X", slug: "x", id: orgId });
    const dto = OrganizationMapper.toDto(o);
    expect("archive" in dto).toBe(false);
    expect("pullDomainEvents" in dto).toBe(false);
  });

  it("project description null-safe", () => {
    const p = Project.create({
      organizationId: orgId,
      name: "NoDesc",
      ownerId: "u",
    });
    const dto = ProjectMapper.toDto(p);
    expect(dto.description === null || typeof dto.description === "string").toBe(
      true,
    );
  });
});
