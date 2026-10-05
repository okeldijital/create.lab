import Link from "next/link";
import { CreateProjectForm } from "../../components/create-project-form";
import { WorkspaceShell } from "../../components/workspace-shell";
import { listProjects } from "../../lib/application-runtime";
import {
  getApplicationContext,
  MissingRequestContextError,
} from "../../lib/request-context";

function projectStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default async function ProjectsPage() {
  try {
    const context = await getApplicationContext();
    const projects = await listProjects(context);

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title="Projects">
        <section className="cl-page-intro">
          <div>
            <p className="cl-page-intro__eyebrow">PROJECT WORKSPACE</p>
            <h2>Active work, clearly organised.</h2>
            <p>
              Projects are the operational centre of Create Lab. Open a project
              to see its client, status, work and next action.
            </p>
          </div>
          <div className="cl-page-intro__action">
            <CreateProjectForm />
          </div>
        </section>

        <section className="cl-projects" aria-labelledby="projects-heading">
          <div className="cl-section-heading">
            <div>
              <p className="cl-section-heading__eyebrow">WORK</p>
              <h2 id="projects-heading">Projects</h2>
            </div>
            <span className="cl-status-note">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="cl-empty-state">
              <strong>No projects yet.</strong>
              <p>Create the first project to start the workspace.</p>
            </div>
          ) : (
            <div className="cl-project-list">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="cl-project-row"
                >
                  <span className="cl-project-row__main">
                    <strong>{project.name}</strong>
                    {project.description ? (
                      <span>{project.description}</span>
                    ) : (
                      <span>No project description</span>
                    )}
                  </span>
                  <span className="cl-project-row__meta">
                    <span className="cl-status-badge">
                      {projectStatusLabel(project.status)}
                    </span>
                    <span className="cl-project-row__arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title="Projects">
        <article>
          <h2>Sign in required</h2>
          <p>Your session was not found. Sign in again to open this workspace.</p>
          <Link href="/login">Sign in</Link>
        </article>
      </WorkspaceShell>
    );
  }
}
