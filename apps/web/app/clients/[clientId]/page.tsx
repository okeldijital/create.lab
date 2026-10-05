import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@creative-lab/ui";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { listProjects } from "../../../lib/application-runtime";
import { getProjectClient, listClientProjects } from "../../../lib/project-clients";
import { getApplicationContext, MissingRequestContextError } from "../../../lib/request-context";

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  try {
    const context = await getApplicationContext();
    const { clientId } = await params;
    const client = await getProjectClient(context.organizationId, clientId);
    if (!client) notFound();
    const projectIds = await listClientProjects(context.organizationId, clientId);
    const projects = await listProjects(context);
    const linkedProjects = projects.filter((project) => projectIds.includes(project.id));

    return (
      <WorkspaceShell eyebrow="CLIENT" title={client.name}>
        <div className="cl-client-detail">
          <Link className="cl-back-link" href="/clients">← Back to clients</Link>
          <section className="cl-client-detail__hero">
            <div className="cl-client-detail__identity">
              <span className="cl-avatar cl-avatar--large" aria-hidden="true">{client.name.slice(0, 1).toUpperCase()}</span>
              <div><p className="cl-kicker">CLIENT PROFILE</p><h2>{client.name}</h2><p>Primary relationship for this workspace.</p></div>
            </div>
            <div className="cl-client-detail__contact"><span>CONTACT</span><strong>{client.email}</strong>{client.phone ? <span>{client.phone}</span> : null}</div>
          </section>
          <div className="cl-client-detail__grid">
            <Card title="Projects"><span className="cl-overview__value">{linkedProjects.length}</span><p>Projects connected to this client.</p></Card>
            <Card title="Relationship"><p className="cl-detail-copy">Client records will become the shared relationship context for briefs, communication, quotes, contracts and delivery.</p></Card>
          </div>
          <section className="cl-linked-projects">
            <div className="cl-section-heading"><div><p className="cl-kicker">WORK</p><h2>Linked projects</h2></div><Link href="/projects">View all projects</Link></div>
            {linkedProjects.length ? <div className="cl-client-list">{linkedProjects.map((project) => <article className="cl-client-row" key={project.id}><div><h2>{project.name}</h2><p>{project.status}</p></div><Link href={`/projects/${project.id}`}>Open project →</Link></article>)}</div> : <Card><div className="cl-empty-state"><h2>No linked projects</h2><p>Create a project and connect this client to begin the relationship.</p></div></Card>}
          </section>
        </div>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="CLIENT" title="Client"><Card title="Workspace access required"><p>Your account is signed in, but an organization workspace is not available yet.</p><Link href="/organization">Open organization</Link></Card></WorkspaceShell>;
  }
}