import Link from "next/link";
import { Card } from "@creative-lab/ui";
import { WorkspaceShell } from "../components/workspace-shell";
import { getOptionalSession } from "../lib/auth/session";
import { listProjects } from "../lib/application-runtime";
import { getApplicationContext, MissingRequestContextError } from "../lib/request-context";

export default async function HomePage() {
  const session = await getOptionalSession();

  if (!session) {
    return (
      <main className="auth-landing">
        <section className="auth-landing__card" aria-labelledby="landing-title">
          <div className="auth-landing__brand">Create Lab</div>
          <h1 id="landing-title">Creative work, organized.</h1>
          <p className="auth-landing__description">
            Sign in to your workspace or create an account to get started.
          </p>
          <div className="auth-landing__actions">
            <Link className="auth-landing__primary" href="/login">Sign In</Link>
            <Link className="auth-landing__secondary" href="/signup">Create Account</Link>
          </div>
        </section>
      </main>
    );
  }

  try {
    const context = await getApplicationContext();
    const projects = await listProjects(context);
    const activeProjects = projects.filter((project) => project.status !== "completed");
    const completedProjects = projects.filter((project) => project.status === "completed");

    return (
      <WorkspaceShell eyebrow="OVERVIEW" title="Overview">
        <div className="cl-overview">
          <section className="cl-overview__intro" aria-labelledby="overview-heading">
            <div>
              <p className="cl-kicker">ATTENTION</p>
              <h2 id="overview-heading">What requires your attention?</h2>
              <p>Keep active creative work moving, resolve blockers, and take the next operational action.</p>
            </div>
            <Link className="cl-button cl-button--primary" href="/projects">Open projects</Link>
          </section>

          <section className="cl-overview__grid" aria-label="Workspace status">
            <Card title="Active work">
              <strong className="cl-overview__value">{activeProjects.length}</strong>
              <p>Projects currently requiring work or follow-up.</p>
            </Card>
            <Card title="Completed">
              <strong className="cl-overview__value">{completedProjects.length}</strong>
              <p>Projects that have reached completion.</p>
            </Card>
            <Card title="Projects">
              <strong className="cl-overview__value">{projects.length}</strong>
              <p>Total projects in this workspace.</p>
            </Card>
          </section>

          <Card title="Next actions">
            {activeProjects.length === 0 ? (
              <div className="cl-overview__empty">
                <strong>No active projects.</strong>
                <p>Start a project to begin building your operational workspace.</p>
                <Link className="cl-button cl-button--secondary" href="/projects">Create project</Link>
              </div>
            ) : (
              <ul className="cl-overview__list">
                {activeProjects.slice(0, 5).map((project) => (
                  <li key={project.id}>
                    <div>
                      <Link href={`/projects/${project.id}`}>{project.name}</Link>
                      <span>{project.status}</span>
                    </div>
                    <Link href={`/projects/${project.id}`}>Open</Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;

    return (
      <WorkspaceShell eyebrow="OVERVIEW" title="Overview">
        <Card title="Workspace access required">
          <p>Your account is signed in, but an organization workspace is not available yet.</p>
          <Link href="/organization">Open organization</Link>
        </Card>
      </WorkspaceShell>
    );
  }
}
