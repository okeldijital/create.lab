import Link from "next/link";
import { Card } from "@creative-lab/ui";
import { WorkspaceShell } from "../components/workspace-shell";
import { getOptionalSession } from "../lib/auth/session";
import { listProjects } from "../lib/application-runtime";
import { getApplicationContext, MissingRequestContextError } from "../lib/request-context";

const workflowLinks = [
  { href: "/projects", label: "Projects", description: "Review active work and open a project." },
  { href: "/schedule", label: "Schedule", description: "See what is ready to be planned." },
  { href: "/production", label: "Production", description: "Move work through production." },
  { href: "/reviews", label: "Reviews", description: "Handle work waiting for a decision." },
  { href: "/deliveries", label: "Deliveries", description: "Complete work ready to leave." },
];

const attentionStatuses = new Set(["blocked", "review", "pending"]);

function formatStatus(status: string) {
  return status.replace(/[-_]/g, " ");
}

export default async function HomePage() {
  const session = await getOptionalSession();

  if (!session) {
    return (
      <main className="auth-landing">
        <section className="auth-landing__card" aria-labelledby="landing-title">
          <div className="auth-landing__brand">Create Lab</div>
          <h1 id="landing-title">Creative work, organized.</h1>
          <p className="auth-landing__description">Sign in to your workspace or create an account to get started.</p>
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
    const attentionProjects = activeProjects.filter((project) => attentionStatuses.has(project.status.toLowerCase()));
    const inProgressProjects = activeProjects.filter((project) => !attentionStatuses.has(project.status.toLowerCase()));

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title="Overview">
        <div className="cl-overview">
          <section className="cl-overview__intro" aria-labelledby="overview-heading">
            <div>
              <p className="cl-kicker">ATTENTION & ACTION</p>
              <h2 id="overview-heading">Keep the work moving.</h2>
              <p>Start with what needs a decision, then move into the workflow surface for the next step.</p>
            </div>
            <Link className="cl-button cl-button--primary" href="/projects">Open projects</Link>
          </section>

          <section className="cl-overview__attention" aria-labelledby="attention-heading">
            <div className="cl-section-heading">
              <div>
                <p className="cl-section-heading__eyebrow">NEEDS ATTENTION</p>
                <h2 id="attention-heading">{attentionProjects.length ? "Work waiting on a decision." : "Nothing is blocked."}</h2>
              </div>
              <span className="cl-overview__count">{attentionProjects.length}</span>
            </div>

            {attentionProjects.length ? (
              <div className="cl-overview__action-list">
                {attentionProjects.slice(0, 5).map((project) => (
                  <Link className="cl-overview__action" href={`/projects/${project.id}`} key={project.id}>
                    <span><strong>{project.name}</strong><small>{formatStatus(project.status)}</small></span>
                    <span className="cl-overview__action-arrow">Open →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="cl-overview__clear">
                <strong>All active projects can continue.</strong>
                <p>There are no projects currently marked blocked, pending or review.</p>
              </div>
            )}
          </section>

          <section className="cl-overview__next" aria-labelledby="next-heading">
            <div className="cl-section-heading">
              <div>
                <p className="cl-section-heading__eyebrow">NEXT ACTION</p>
                <h2 id="next-heading">Move into the workflow.</h2>
              </div>
            </div>
            <div className="cl-overview__workflow">
              {workflowLinks.map((item) => (
                <Link className="cl-overview__workflow-link" href={item.href} key={item.href}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                  <small>Open →</small>
                </Link>
              ))}
            </div>
          </section>

          <section className="cl-overview__summary" aria-label="Workspace summary">
            <Card title="Active work">
              <strong className="cl-overview__value">{activeProjects.length}</strong>
              <p>{inProgressProjects.length} currently in progress · {attentionProjects.length} needing attention</p>
            </Card>
            <Card title="Completed">
              <strong className="cl-overview__value">{projects.filter((project) => project.status === "completed").length}</strong>
              <p>Projects that have reached completion.</p>
            </Card>
            <Card title="Total projects">
              <strong className="cl-overview__value">{projects.length}</strong>
              <p>All projects in this workspace.</p>
            </Card>
          </section>
        </div>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="WORKSPACE" title="Overview"><Card title="Workspace access required"><p>Your account is signed in, but an organization workspace is not available yet.</p><Link href="/organization">Open organization</Link></Card></WorkspaceShell>;
  }
}
