import Link from "next/link";
import { Card } from "@creative-lab/ui";
import { WorkspaceShell } from "../../components/workspace-shell";
import { listProjects } from "../../lib/application-runtime";
import { listProjectClients } from "../../lib/project-clients";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";


export default async function ClientsPage() {
  try {
    const context = await getApplicationContext();
    const projects = await listProjects(context);
    const rows = (await Promise.all(
      projects.map(async (project) => {
        const clients = await listProjectClients(context.organizationId, project.id);
        return clients.map((client) => ({ ...client, projectId: project.id, projectName: project.name }));
      }),
    )).flat();

    const clients = Array.from(new Map(rows.map((client) => [client.id, client])).values());

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title="Clients">
        <div className="cl-clients">
          <section className="cl-page-intro">
            <div>
              <p className="cl-kicker">RELATIONSHIPS</p>
              <h2>Keep client work connected.</h2>
              <p>Clients are the people and businesses your creative work moves through. Open a client to continue the work attached to their projects.</p>
            </div>
            <Link className="cl-button cl-button--primary" href="/projects">Open projects</Link>
          </section>

          <section className="cl-clients__toolbar" aria-label="Client controls">
            <div><strong>{clients.length}</strong><span>{clients.length === 1 ? "client" : "clients"} in this workspace</span></div>
            <span className="cl-status-note">Client intake is currently project-led.</span>
          </section>

          {clients.length === 0 ? (
            <Card>
              <div className="cl-empty-state">
                <p className="cl-kicker">NO CLIENTS YET</p>
                <h2>Your client workspace is ready.</h2>
                <p>Create a project and add its client to begin building the relationship record.</p>
                <Link className="cl-button cl-button--secondary" href="/projects">Create or open a project</Link>
              </div>
            </Card>
          ) : (
            <section className="cl-client-list" aria-label="Clients">
              {clients.map((client) => (
                <article className="cl-client-row" key={client.id}>
                  <div className="cl-client-row__identity">
                    <span className="cl-avatar" aria-hidden="true">{client.name.slice(0, 1).toUpperCase()}</span>
                    <div><h2>{client.name}</h2><p>{client.email}{client.phone ? ` · ${client.phone}` : ""}</p></div>
                  </div>
                  <div className="cl-client-row__meta"><span>Project</span><Link href={`/projects/${client.projectId}`}>{client.projectName}</Link></div>
                </article>
              ))}
            </section>
          )}
        </div>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="WORKSPACE" title="Clients"><Card title="Workspace access required"><p>Your account is signed in, but an organization workspace is not available yet.</p><Link href="/organization">Open organization</Link></Card></WorkspaceShell>;
  }
}