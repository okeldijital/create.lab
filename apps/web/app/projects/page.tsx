import Link from "next/link";
import { WorkspaceShell } from "../../components/workspace-shell";
import { listProjects } from "../../lib/application-runtime";
import {
  getApplicationContext,
  MissingRequestContextError,
} from "../../lib/request-context";

export default async function ProjectsPage() {
  try {
    const context = await getApplicationContext();
    const projects = await listProjects(context);

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title="Projects">
        <article>
          <h2>Project workspace</h2>
          {projects.length === 0 ? (
            <p>No projects in this organization yet.</p>
          ) : (
            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}`}>{project.name}</Link>
                  <span> {project.status}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </WorkspaceShell>
    );
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;

    return (
      <WorkspaceShell eyebrow="WORKSPACE" title="Projects">
        <article>
          <h2>Sign in required</h2>
          <p>An authenticated organization membership is required before projects can be listed.</p>
          <Link href="/login">Sign in</Link>
        </article>
      </WorkspaceShell>
    );
  }
}
