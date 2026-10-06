import Link from "next/link";
import { CreateProjectForm } from "../../components/create-project-form";
import { WorkspaceShell } from "../../components/workspace-shell";
import { listProjects } from "../../lib/application-runtime";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

function projectStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function projectStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return "success";
  if (normalized === "blocked") return "danger";
  if (normalized === "review" || normalized === "pending") return "warning";
  if (normalized === "in_progress" || normalized === "in-progress") return "info";
  return "neutral";
}

export default async function ProjectsPage() {
  try {
    const context = await getApplicationContext();
    const projects = await listProjects(context);
    const activeProjects = projects.filter((project) => project.status.toLowerCase() !== "completed");
    const completedProjects = projects.filter((project) => project.status.toLowerCase() === "completed");

    const renderProjectList = (items: typeof projects) => items.length === 0 ? (
      <div className="cl-empty-state">
        <strong>No projects in this state.</strong>
        <p>Projects will appear here as their workflow state changes.</p>
      </div>
    ) : (
      <div className="cl-project-list">
        {items.map((project) => (
          <Link key={project.id} href={"/projects/" + project.id} className="cl-project-row" aria-label={"Open project " + project.name}>
            <span className="cl-project-row__main">
              <strong>{project.name}</strong>
              <span>{project.description ?? "No project description"}</span>
            </span>
            <span className="cl-project-row__meta">
              <span className={"cl-status-badge cl-status-badge--" + projectStatusTone(project.status)}>
                {projectStatusLabel(project.status)}
              </span>
              <span className="cl-project-row__arrow" aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    );

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title="Projects">
        <section className="cl-page-intro">
          <div>
            <p className="cl-page-intro__eyebrow">PROJECT WORKSPACE</p>
            <h2>Active work, clearly organised.</h2>
            <p>Projects are the operational centre of Create Lab. Open a project to see its client, status, work and next action.</p>
          </div>
          <div className="cl-page-intro__action"><CreateProjectForm /></div>
        </section>

        {projects.length === 0 ? (
          <section className="cl-projects" aria-labelledby="projects-heading">
            <div className="cl-section-heading">
              <div>
                <p className="cl-section-heading__eyebrow">WORK</p>
                <h2 id="projects-heading">Projects</h2>
              </div>
              <span className="cl-status-note">0 projects</span>
            </div>
            <div className="cl-empty-state">
              <strong>No projects yet.</strong>
              <p>Create the first project to start the workspace.</p>
            </div>
          </section>
        ) : (
          <div className="cl-project-sections">
            <section className="cl-project-section" aria-labelledby="active-projects-heading">
              <div className="cl-section-heading">
                <div>
                  <p className="cl-section-heading__eyebrow">ACTIVE WORK</p>
                  <h2 id="active-projects-heading">Current projects</h2>
                </div>
                <span className="cl-status-note">{activeProjects.length} active</span>
              </div>
              {renderProjectList(activeProjects)}
            </section>

            {completedProjects.length > 0 ? (
              <section className="cl-project-section" aria-labelledby="completed-projects-heading">
                <div className="cl-section-heading">
                  <div>
                    <p className="cl-section-heading__eyebrow">COMPLETED</p>
                    <h2 id="completed-projects-heading">Finished projects</h2>
                  </div>
                  <span className="cl-status-note">{completedProjects.length} completed</span>
                </div>
                {renderProjectList(completedProjects)}
              </section>
            ) : null}
          </div>
        )}
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
