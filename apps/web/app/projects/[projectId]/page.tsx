import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@creative-lab/ui";
import { AddClientForm } from "../../../components/add-client-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getProject } from "../../../lib/application-runtime";
import { getProjectClient, listProjectClients } from "../../../lib/project-clients";
import {
  getApplicationContext,
  MissingRequestContextError,
} from "../../../lib/request-context";

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return "success";
  if (normalized === "blocked") return "danger";
  if (normalized === "review" || normalized === "pending") return "warning";
  if (normalized === "in_progress" || normalized === "in-progress") return "info";
  return "neutral";
}

function nextAction(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return "Project complete.";
  if (normalized === "blocked") return "Resolve the blocker before continuing.";
  if (normalized === "review") return "Review the current work before proceeding.";
  if (normalized === "pending") return "Move the project into its next workflow state.";
  if (normalized === "in_progress" || normalized === "in-progress") return "Continue the current project work.";
  return "Advance the project into its next workflow state.";
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  try {
    const context = await getApplicationContext();
    const { projectId } = await params;
    const project = await getProject(projectId, context);

    if (!project) notFound();

    const clients = await listProjectClients(context.organizationId, projectId);
    const primaryClient = clients[0]
      ? await getProjectClient(context.organizationId, clients[0].id)
      : null;

    return (
      <WorkspaceShell eyebrow="PROJECT WORKSPACE" title={project.name}>
        <div className="cl-project-workspace">
          <Link href="/projects" className="cl-back-link">
            ← Back to projects
          </Link>

          <section className="cl-project-hero">
            <div className="cl-project-hero__identity">
              <p className="cl-project-hero__eyebrow">PROJECT</p>
              <h2>{project.name}</h2>
              <p>{project.description ?? "No project description yet."}</p>
            </div>
            <span className={`cl-status-badge cl-status-badge--hero cl-status-badge--${statusTone(project.status)}`}>
              {statusLabel(project.status)}
            </span>
          </section>

          <div className="cl-project-workspace__grid">
            <Card>
              <p className="cl-section-heading__eyebrow">NEXT ACTION</p>
              <h2>{nextAction(project.status)}</h2>
              <p className="cl-detail-copy">
                The workspace is showing the next workflow-level decision
                without inventing task data that is not yet connected.
              </p>
            </Card>

            <Card>
              <p className="cl-section-heading__eyebrow">CLIENT</p>
              {primaryClient ? (
                <>
                  <h2>{primaryClient.name}</h2>
                  <p className="cl-detail-copy">
                    {primaryClient.email ?? "No email"}{primaryClient.phone ? ` · ${primaryClient.phone}` : ""}
                  </p>
                  <Link
                    href={`/clients/${primaryClient.id}`}
                    className="cl-back-link"
                  >
                    Open client →
                  </Link>
                </>
              ) : (
                <>
                  <h2>No client linked</h2>
                  <p className="cl-detail-copy">
                    Connect the client before moving deeper into the workflow.
                  </p>
                  <AddClientForm projectId={projectId} />
                </>
              )}
            </Card>
          </div>

          <section className="cl-project-section">
            <div className="cl-section-heading">
              <div>
                <p className="cl-section-heading__eyebrow">WORKFLOW</p>
                <h2>Project lifecycle</h2>
              </div>
              <span className="cl-status-note">Current state</span>
            </div>
            <div className="cl-lifecycle">
              {[
                "Inquiry",
                "Intake",
                "Quote",
                "Accepted",
                "Deposit",
                "Scheduled",
                "In Production",
                "Internal Review",
                "Client Review",
                "Revision",
                "Approved",
                "Balance",
                "Delivery",
                "Completed",
              ].map((stage) => (
                <span
                  key={stage}
                  className={`cl-lifecycle__step${stage.toLowerCase().replace(/ /g, "_") === project.status.toLowerCase() ? " is-current" : ""}`}
                >
                  {stage}
                </span>
              ))}
            </div>
          </section>

          <section className="cl-project-section">
            <div className="cl-section-heading">
              <div>
                <p className="cl-section-heading__eyebrow">ACTIVITY</p>
                <h2>Project activity</h2>
              </div>
            </div>
            <div className="cl-empty-state">
              <strong>Activity timeline is ready for the workflow layer.</strong>
              <p>
                Scheduling, production, reviews and delivery events will appear
                here as those bounded contexts connect to the workspace.
              </p>
            </div>
          </section>
        </div>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;

    return (
      <WorkspaceShell eyebrow="PROJECT WORKSPACE" title="Project">
        <article>
          <h2>Sign in required</h2>
          <p>Your session was not found. Sign in again to open this workspace.</p>
          <Link href="/login">Sign in</Link>
        </article>
      </WorkspaceShell>
    );
  }
}
