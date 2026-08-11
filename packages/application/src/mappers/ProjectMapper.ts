import type { Project } from "@creative-lab/projects";
import type { ProjectDto } from "../dto/common.js";

export class ProjectMapper {
  static toDto(project: Project): ProjectDto {
    return {
      id: project.id,
      organizationId: project.organizationId,
      name: project.name.value,
      status: project.status,
      ownerId: project.ownerId,
      description: project.description?.value ?? null,
    };
  }
}
