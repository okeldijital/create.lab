import { AddClientForm } from "../../../components/add-client-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getProject } from "../../../lib/application-runtime";
import { listProjectClients } from "../../../lib/project-clients";
import { getApplicationContext } from "../../../lib/request-context";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const context = await getApplicationContext();
  const { projectId } = await params;
  const project = await getProject(projectId, context);
  const clients = await listProjectClients(context.organizationId, projectId);

  return (
    <WorkspaceShell eyebrow="PROJECT" title={project.name}>
      <article>
        <p>{project.description ?? "No project description."}</p>
        <dl>
          <div>
            <dt>Status</dt>
            <dd>{project.status}</dd>
          </div>
        </dl>
      </article>
      <article>
        <h2>Client</h2>
        {clients.length === 0 ? <p>No client on this project yet.</p> : (
          <ul>
            {clients.map((client) => (
              <li key={client.id}>
                {client.name} · {client.email}{client.phone ? ` · ${client.phone}` : ""}
              </li>
            ))}
          </ul>
        )}
        <AddClientForm projectId={projectId} />
      </article>
    </WorkspaceShell>
  );
}
